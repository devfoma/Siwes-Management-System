import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

// Safe dynamic import configuration for react-native-webrtc modules
let RTCPeerConnection: any;
let RTCView: any;
let mediaDevices: any;
let RTCIceCandidate: any;
let RTCSessionDescription: any;

try {
  const webrtc = require('react-native-webrtc');
  RTCPeerConnection = webrtc.RTCPeerConnection;
  RTCView = webrtc.RTCView;
  mediaDevices = webrtc.mediaDevices;
  RTCIceCandidate = webrtc.RTCIceCandidate;
  RTCSessionDescription = webrtc.RTCSessionDescription;
} catch (e) {
  // WebRTC native modules are unavailable (e.g. running in Expo Go sandbox)
}

interface VideoCallRoomProps {
  onLeave: () => void;
}

type CallMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
};

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ onLeave }) => {
  const { user } = useAuth();
  const {
    activeStudentProfile,
    currentUserId,
    currentUserName,
    selectedStudentId,
    supervisionSessions,
    userRole,
  } = useSIWES();
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [callStatus, setCallStatus] = useState<'WAITING' | 'CONNECTING' | 'CONNECTED' | 'FAILED'>('WAITING');

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const pcRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const hasCreatedOfferRef = useRef(false);
  const pendingCandidatesRef = useRef<any[]>([]);

  const activeSession =
    supervisionSessions.find((session) => {
      if (userRole === 'SUPERVISOR') {
        return session.studentId === selectedStudentId && session.supervisorId === currentUserId;
      }
      return session.studentId === currentUserId;
    }) || supervisionSessions[0];

  const remoteDisplayName =
    userRole === 'SUPERVISOR'
      ? activeStudentProfile?.fullName || 'Assigned Student'
      : 'Supervisor';
  const remoteInitials = remoteDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'SV';

  useEffect(() => {
    if (!activeSession?.roomId || !currentUserId) return;

    let active = true;
    let streamForCleanup: any = null;
    const roomId = activeSession.roomId;
    const isOfferer = userRole === 'SUPERVISOR';
    hasCreatedOfferRef.current = false;
    pendingCandidatesRef.current = [];

    const sendSignal = async (type: string, payload: any) => {
      await channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          roomId,
          senderId: currentUserId,
          type,
          payload,
        },
      });
    };

    const applyPendingCandidates = async (pc: any) => {
      const candidates = [...pendingCandidatesRef.current];
      pendingCandidatesRef.current = [];
      for (const candidate of candidates) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const createOffer = async (pc: any) => {
      if (hasCreatedOfferRef.current) return;
      hasCreatedOfferRef.current = true;
      setCallStatus('CONNECTING');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: true,
      });
      await pc.setLocalDescription(offer);
      await sendSignal('offer', offer);
    };

    const handleRemoteSignal = async (signal: any, pc: any) => {
      if (!signal || signal.roomId !== roomId || signal.senderId === currentUserId) return;

      try {
        if (signal.type === 'offer') {
          setCallStatus('CONNECTING');
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
          await applyPendingCandidates(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal('answer', answer);
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
          await applyPendingCandidates(pc);
        } else if (signal.type === 'candidate') {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
          } else {
            pendingCandidatesRef.current.push(signal.payload);
          }
        } else if (signal.type === 'leave') {
          setCallStatus('WAITING');
          setRemoteStream(null);
        }
      } catch (error) {
        console.error('Error applying WebRTC signal:', error);
        setCallStatus('FAILED');
      }
    };

    const startLocalStream = async () => {
      if (!mediaDevices) {
        setCallStatus('FAILED');
        Alert.alert(
          'WebRTC Unavailable',
          'react-native-webrtc requires a development build or production native build. It is not available in Expo Go.'
        );
        return;
      }

      try {
        const constraints = {
          audio: true,
          video: {
            frameRate: 30,
            facingMode: 'user',
          },
        };

        const stream = await mediaDevices.getUserMedia(constraints);
        streamForCleanup = stream;

        if (!active) return;
        setLocalStream(stream);

        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        };
        const pc = new RTCPeerConnection(configuration);
        pcRef.current = pc;

        stream.getTracks().forEach((track: any) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event: any) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            setCallStatus('CONNECTED');
          }
        };

        pc.onicecandidate = async (event: any) => {
          if (event.candidate) {
            await sendSignal('candidate', event.candidate);
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') setCallStatus('CONNECTED');
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') setCallStatus('FAILED');
        };

        const channel = supabase
          .channel(`siwes-call-${roomId}`, {
            config: { broadcast: { self: false } },
          })
          .on('broadcast', { event: 'signal' }, ({ payload }: any) => {
            handleRemoteSignal(payload, pc);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED' && isOfferer) {
              await createOffer(pc);
            }
          });

        channelRef.current = channel;
      } catch (err) {
        console.error('getUserMedia failed:', err);
        setCallStatus('FAILED');
        Alert.alert('Media Access Failed', 'Unable to access front camera/microphone.');
      }
    };

    startLocalStream();

    return () => {
      active = false;
      sendSignal('leave', null).catch(() => undefined);
      streamForCleanup?.getTracks().forEach((track: any) => track.stop());
      pcRef.current?.close();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [activeSession?.roomId, currentUserId, userRole]);

  useEffect(() => {
    if (!activeSession?.roomId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('call_messages')
        .select('*')
        .eq('room_id', activeSession.roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(
          data.map((row: any) => ({
            id: row.id,
            senderId: row.sender_id,
            senderName: row.sender_name,
            text: row.text,
            createdAt: row.created_at,
          }))
        );
      }
    };

    loadMessages();

    const channel = supabase
      .channel(`siwes-call-messages-${activeSession.roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_messages',
          filter: `room_id=eq.${activeSession.roomId}`,
        },
        (payload: any) => {
          const row = payload.new;
          setMessages((prev) => [
            ...prev,
            {
              id: row.id,
              senderId: row.sender_id,
              senderName: row.sender_name,
              text: row.text,
              createdAt: row.created_at,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession?.roomId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeSession?.roomId || !user) return;
    const text = inputText.trim();
    setInputText('');

    const { error } = await supabase.from('call_messages').insert({
      room_id: activeSession.roomId,
      sender_id: user.id,
      sender_name: currentUserName,
      text,
    });

    if (error) {
      Alert.alert('Message Failed', error.message);
    }
  };

  const handleToggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = cameraOff;
      }
    }
    setCameraOff(!cameraOff);
  };

  const handleToggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = micMuted;
      }
    }
    setMicMuted(!micMuted);
  };

  if (!activeSession) {
    return (
      <View style={styles.container}>
        <View style={styles.videoPlaceholder}>
          <View style={styles.supervisorAvatar}>
            <MaterialIcons name="event-busy" size={36} color="#77da9f" />
          </View>
          <Text style={styles.videoStreamLabel}>No supervision session scheduled</Text>
          <Text style={styles.signalStatus}>Ask a supervisor or admin to schedule a session before joining a call.</Text>
          <TouchableOpacity onPress={onLeave} style={[styles.deckBtn, styles.endCallBtn]}>
            <MaterialIcons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Top Bar controls */}
      <View style={styles.topBar}>
        <View style={styles.sessionInfo}>
          <View style={styles.ledLive} />
          <View>
            <Text style={styles.liveTitle}>Video Supervision {callStatus}</Text>
            <Text style={styles.roomId}>Room: {activeSession.roomId}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setChatOpen(!chatOpen)}
          style={[styles.circleBtn, chatOpen && styles.circleBtnActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="chat" size={18} color={chatOpen ? '#261a00' : '#ffffff'} />
        </TouchableOpacity>
      </View>

      {/* Main video call layout */}
      <View style={styles.videoArea}>
        {/* Remote Video (Supervisor) */}
        <View style={styles.remoteVideoContainer}>
          {remoteStream && RTCView ? (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.fullVideo}
              objectFit="cover"
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <View style={styles.supervisorAvatar}>
                <Text style={styles.avatarText}>{remoteInitials}</Text>
              </View>
              <Text style={styles.videoStreamLabel}>{remoteDisplayName}</Text>
              <Text style={styles.signalStatus}>
                {callStatus === 'FAILED' ? 'Connection failed. Check media permissions and network.' : 'Awaiting remote peer connection...'}
              </Text>
            </View>
          )}

          {/* Local PIP View */}
          <View style={styles.localPip}>
            {localStream && !cameraOff && RTCView ? (
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.pipVideo}
                objectFit="cover"
              />
            ) : (
              <View style={styles.localAvatarContainer}>
                <View style={styles.localAvatar}>
                  <Text style={styles.localAvatarText}>Self</Text>
                </View>
              </View>
            )}
          </View>

          {/* Network indicator */}
          <View style={styles.networkBadge}>
            <MaterialIcons name="network-wifi" size={10} color="#77da9f" />
            <Text style={styles.networkText}>WebRTC Live</Text>
          </View>
        </View>

        {/* Messaging Chat Drawer Overlay */}
        {chatOpen && (
          <View style={styles.chatDrawer}>
            <ScrollView contentContainerStyle={styles.chatScroll}>
              {messages.map((msg, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.msgWrapper,
                    msg.senderId === currentUserId ? styles.msgSelf : styles.msgRemote,
                  ]}
                >
                  <Text style={styles.msgSender}>{msg.senderName}</Text>
                  <View
                    style={[
                      styles.msgBubble,
                      msg.senderId === currentUserId ? styles.bubbleSelf : styles.bubbleRemote,
                    ]}
                  >
                    <Text style={styles.msgText}>{msg.text}</Text>
                  </View>
                  <Text style={styles.msgTime}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <View style={styles.chatInputContainer}>
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Send call message..."
                  placeholderTextColor="#666"
                  style={styles.chatInput}
                />
              </View>
              <TouchableOpacity onPress={handleSendMessage} style={styles.sendBtn}>
                <MaterialIcons name="send" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Tactile Control Call Deck */}
      <View style={styles.controlDeck}>
        <TouchableOpacity
          onPress={handleToggleMic}
          style={[styles.deckBtn, micMuted && styles.deckBtnAlert]}
          activeOpacity={0.8}
        >
          <MaterialIcons name={micMuted ? 'mic-off' : 'mic'} size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleToggleCamera}
          style={[styles.deckBtn, cameraOff && styles.deckBtnAlert]}
          activeOpacity={0.8}
        >
          <MaterialIcons name={cameraOff ? 'videocam-off' : 'videocam'} size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLeave}
          style={[styles.deckBtn, styles.endCallBtn]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="call-end" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a100c',
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#1b211d',
    borderBottomWidth: 1,
    borderBottomColor: '#0f5132',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ledLive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffc107',
  },
  liveTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roomId: {
    color: '#c0c9c0',
    fontSize: 9,
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f1511',
    borderWidth: 1,
    borderColor: '#0f5132',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnActive: {
    backgroundColor: '#ffc107',
  },
  videoArea: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#0a100c',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  videoPlaceholder: {
    alignItems: 'center',
    gap: 12,
  },
  supervisorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1b211d',
    borderWidth: 2,
    borderColor: '#0f5132',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#95d4ac',
  },
  videoStreamLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  signalStatus: {
    fontSize: 10,
    color: '#fabd00',
  },
  localPip: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#1b211d',
    borderWidth: 1.5,
    borderColor: '#0f5132',
    overflow: 'hidden',
  },
  pipVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  localAvatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  localAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a100c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0f5132',
  },
  localAvatarText: {
    color: '#95d4ac',
    fontSize: 12,
    fontWeight: 'bold',
  },
  networkBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  networkText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  chatDrawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#1b211d',
    borderLeftWidth: 1,
    borderLeftColor: '#0f5132',
    zIndex: 10,
  },
  chatScroll: {
    padding: 12,
    gap: 12,
  },
  msgWrapper: {
    gap: 2,
    maxWidth: '90%',
  },
  msgSelf: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  msgRemote: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  msgSender: {
    fontSize: 8,
    color: '#77da9f',
    fontWeight: 'bold',
  },
  msgBubble: {
    padding: 8,
    borderRadius: 6,
  },
  bubbleSelf: {
    backgroundColor: '#0f5132',
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(149, 212, 172, 0.15)',
  },
  bubbleRemote: {
    backgroundColor: '#171d19',
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  msgText: {
    fontSize: 10,
    color: '#ffffff',
    lineHeight: 14,
  },
  msgTime: {
    fontSize: 7,
    color: '#c0c9c0',
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  chatInputContainer: {
    flex: 1,
    backgroundColor: '#0a100c',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 30,
    justifyContent: 'center',
  },
  chatInput: {
    color: '#ffffff',
    fontSize: 11,
    padding: 0,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#198754',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDeck: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#1b211d',
    borderTopWidth: 1,
    borderTopColor: '#0f5132',
  },
  deckBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f1511',
    borderWidth: 1,
    borderColor: '#0f5132',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckBtnAlert: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  endCallBtn: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
});

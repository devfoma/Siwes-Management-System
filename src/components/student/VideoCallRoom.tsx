import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';

// Safe dynamic import configuration for react-native-webrtc modules
let RTCPeerConnection: any;
let RTCView: any;
let mediaDevices: any;

try {
  const webrtc = require('react-native-webrtc');
  RTCPeerConnection = webrtc.RTCPeerConnection;
  RTCView = webrtc.RTCView;
  mediaDevices = webrtc.mediaDevices;
} catch (e) {
  // WebRTC native modules are unavailable (e.g. running in Expo Go sandbox)
}

interface VideoCallRoomProps {
  onLeave: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ onLeave }) => {
  const { supervisionSessions, studentProfile } = useSIWES();
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Dr. Charity', text: 'Hello Faith, please show me your network rack and switches setup.', time: '12:30 PM' }
  ]);
  const [inputText, setInputText] = useState('');

  // WebRTC Stream states
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const pcRef = useRef<any>(null);

  const activeSession = supervisionSessions[0] || { roomId: 'ROOM-CS-EVAL', scheduledTime: new Date().toISOString() };

  // Acquire local camera and microphone stream
  useEffect(() => {
    let active = true;

    const startLocalStream = async () => {
      if (!mediaDevices) {
        return;
      }
      try {
        const constraints = {
          audio: true,
          video: {
            mandatory: {
              minWidth: 500, // Provide constraint objects
              minHeight: 300,
              minFrameRate: 30
            },
            facingMode: 'user'
          }
        };

        const stream = await mediaDevices.getUserMedia(constraints);
        if (active) {
          setLocalStream(stream);
          setupPeerConnection(stream);
        }
      } catch (err: any) {
        Alert.alert('Media Access Failed', 'Unable to access front camera/microphone.');
      }
    };

    startLocalStream();

    return () => {
      active = false;
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  // Configure RTC Peer Connection
  const setupPeerConnection = (stream: any) => {
    if (!RTCPeerConnection) return;

    try {
      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(configuration);
      pcRef.current = pc;

      // Add local tracks to peer connection
      stream.getTracks().forEach((track: any) => {
        pc.addTrack(track, stream);
      });

      // Listen for remote tracks
      pc.ontrack = (event: any) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Listen for ICE candidates
      pc.onicecandidate = (event: any) => {
        if (event.candidate) {
          // In a production app, transmit candidates to the signaling server (e.g. Supabase Realtime)
        }
      };
    } catch (e) {
      // Handle RTC setup fail silently
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      sender: studentProfile.fullName,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'Dr. Charity',
          text: 'Perfect. Your network switches are looking clean. I will approve your weekly log today.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2000);
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
            <Text style={styles.liveTitle}>Video Supervision Live</Text>
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
                <Text style={styles.avatarText}>CO</Text>
              </View>
              <Text style={styles.videoStreamLabel}>Dr. Charity (Supervisor)</Text>
              <Text style={styles.signalStatus}>Awaiting Remote Peer Connection...</Text>
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
                    msg.sender === studentProfile.fullName ? styles.msgSelf : styles.msgRemote,
                  ]}
                >
                  <Text style={styles.msgSender}>{msg.sender}</Text>
                  <View
                    style={[
                      styles.msgBubble,
                      msg.sender === studentProfile.fullName ? styles.bubbleSelf : styles.bubbleRemote,
                    ]}
                  >
                    <Text style={styles.msgText}>{msg.text}</Text>
                  </View>
                  <Text style={styles.msgTime}>{msg.time}</Text>
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

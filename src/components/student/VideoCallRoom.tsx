import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';

interface VideoCallRoomProps {
  onLeave: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ onLeave }) => {
  const { supervisionSessions } = useSIWES();
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Dr. Charity Onyiyechi', text: 'Hello Faith, please show me your network rack and switches setup.', time: '12:30 PM' }
  ]);
  const [inputText, setInputText] = useState('');

  const activeSession = supervisionSessions[0] || { roomId: 'ROOM-CS-EVAL', scheduledTime: new Date().toISOString() };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      sender: 'Faith Amarachi',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'Dr. Charity Onyiyechi',
          text: 'Perfect. Your network switches are looking clean. I will approve your weekly log today.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2000);
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
        {/* Remote video mockup frame */}
        <View style={styles.remoteVideoContainer}>
          {cameraOff ? (
            <View style={styles.cameraOffTextContainer}>
              <MaterialIcons name="videocam-off" size={48} color="rgba(255,255,255,0.2)" />
              <Text style={styles.cameraOffText}>Your camera is off</Text>
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              {/* Box representing supervisor avatar/stream placeholder */}
              <View style={styles.supervisorAvatar}>
                <Text style={styles.avatarText}>CO</Text>
              </View>
              <Text style={styles.videoStreamLabel}>Dr. Charity Onyiyechi (Supervisor)</Text>
            </View>
          )}

          {/* Local PIP View */}
          <View style={styles.localPip}>
            <View style={styles.pipHeader}>
              <Text style={styles.pipHeaderText}>Self</Text>
            </View>
            <View style={styles.localAvatar}>
              <Text style={styles.localAvatarText}>FA</Text>
            </View>
          </View>

          {/* Network indicator */}
          <View style={styles.networkBadge}>
            <MaterialIcons name="network-wifi" size={10} color="#77da9f" />
            <Text style={styles.networkText}>Ping: 45ms</Text>
          </View>
        </View>

        {/* Overlay chat panel */}
        {chatOpen && (
          <View style={styles.chatDrawer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Session Chat</Text>
              <TouchableOpacity onPress={() => setChatOpen(false)}>
                <MaterialIcons name="close" size={16} color="#c0c9c0" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatMessages} contentContainerStyle={styles.messagesContent}>
              {messages.map((m, i) => {
                const isSelf = m.sender.includes('Faith');
                return (
                  <View key={i} style={[styles.msgWrapper, isSelf && styles.msgWrapperSelf]}>
                    <Text style={styles.msgSender}>{m.sender} • {m.time}</Text>
                    <View style={[styles.msgBubble, isSelf ? styles.bubbleSelf : styles.bubbleRemote]}>
                      <Text style={styles.msgText}>{m.text}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <View style={styles.chatInputContainer}>
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Send message..."
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

      {/* Bottom controllers */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={() => setMicMuted(!micMuted)}
          style={[styles.circleActionBtn, micMuted && styles.btnError]}
        >
          <MaterialIcons name={micMuted ? 'mic-off' : 'mic'} size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCameraOff(!cameraOff)}
          style={[styles.circleActionBtn, cameraOff && styles.btnError]}
        >
          <MaterialIcons name={cameraOff ? 'videocam-off' : 'videocam'} size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setScreenSharing(!screenSharing)}
          style={[styles.circleActionBtn, screenSharing && styles.btnActive]}
        >
          <MaterialIcons name="screen-share" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onLeave} style={styles.endCallBtn} activeOpacity={0.8}>
          <MaterialIcons name="call-end" size={18} color="#ffffff" />
          <Text style={styles.endCallText}>End</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    height: Dimensions.get('window').height - 120,
  },
  topBar: {
    height: 56,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: '#77da9f',
  },
  liveTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  roomId: {
    fontSize: 9,
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnActive: {
    backgroundColor: '#77da9f',
  },
  videoArea: {
    flex: 1,
    flexDirection: 'row',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#121212',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOffTextContainer: {
    alignItems: 'center',
    gap: 8,
  },
  cameraOffText: {
    fontSize: 12,
    color: '#c0c9c0',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 11,
    color: '#c0c9c0',
  },
  localPip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 100,
    height: 75,
    backgroundColor: '#1b211d',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipHeader: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  pipHeaderText: {
    fontSize: 8,
    color: '#ffffff',
  },
  localAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f5132',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#95d4ac',
  },
  networkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  networkText: {
    fontSize: 8,
    color: '#77da9f',
    fontWeight: 'bold',
  },
  chatDrawer: {
    width: 220,
    backgroundColor: 'rgba(27, 33, 29, 0.95)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  chatTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  chatMessages: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    gap: 10,
  },
  msgWrapper: {
    gap: 2,
  },
  msgWrapperSelf: {
    alignItems: 'flex-end',
  },
  msgSender: {
    fontSize: 8,
    color: '#c0c9c0',
  },
  msgBubble: {
    padding: 8,
    borderRadius: 6,
    maxWidth: '90%',
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
  chatInputRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    borderTWidth: 1,
    borderTColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: '#0f5132',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    height: 64,
    backgroundColor: '#171d19',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  circleActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnError: {
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  btnActive: {
    backgroundColor: 'rgba(119, 218, 159, 0.15)',
    borderColor: 'rgba(119, 218, 159, 0.3)',
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderBottomWidth: 3,
    borderBottomColor: '#69101a',
  },
  endCallText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

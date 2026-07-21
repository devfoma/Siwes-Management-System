import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';

interface StudentDashboardProps {
  onAddLog: () => void;
  onJoinCall: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onAddLog, onJoinCall }) => {
  const { logbookEntries, studentProfile } = useSIWES();

  const totalDays = 90;
  const completedDays = logbookEntries.length;
  const percentage = Math.min(Math.round((completedDays / totalDays) * 100), 100);

  const approvedCount = logbookEntries.filter(e => e.supervisorStatus === 'APPROVED').length;
  const pendingCount = logbookEntries.filter(e => e.supervisorStatus === 'PENDING').length;
  const rejectedCount = logbookEntries.filter(e => e.supervisorStatus === 'REJECTED').length;

  const firstName = studentProfile?.fullName ? studentProfile.fullName.split(' ')[0] : 'Student';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome & Info */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.subText}>Operational Dashboard</Text>
          <Text style={styles.welcomeText}>Welcome, {firstName}</Text>
        </View>
        <View style={styles.systemBadge}>
          <View style={[styles.led, styles.ledYellow]} />
          <Text style={styles.systemBadgeText}>Week 8 Active</Text>
        </View>
      </View>

      {/* Progress Cards */}
      <View style={styles.gaugeCard}>
        <Text style={styles.cardLabel}>Internship Completion Progress</Text>
        
        {/* Progress bar representing skeuomorphic gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.gaugeValue}>{percentage}%</Text>
        </View>
        <Text style={styles.gaugeSubText}>{completedDays} of {totalDays} days logged</Text>
      </View>

      {/* Grid of metrics */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <MaterialIcons name="event-available" size={24} color="#95d4ac" />
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{completedDays}</Text>
          <Text style={styles.statSub}>Days</Text>
        </View>

        <View style={styles.statBox}>
          <MaterialIcons name="verified-user" size={24} color="#77da9f" />
          <Text style={styles.statLabel}>Approved</Text>
          <Text style={[styles.statValue, { color: '#77da9f' }]}>{approvedCount}</Text>
          <Text style={styles.statSub}>Logs</Text>
        </View>

        <View style={styles.statBox}>
          <MaterialIcons name="pending-actions" size={24} color="#ffb4ab" />
          <Text style={styles.statLabel}>Pending/Flags</Text>
          <Text style={[styles.statValue, { color: '#ffb4ab' }]}>
            {pendingCount}
            {rejectedCount > 0 && <Text style={styles.rejectedSub}> ({rejectedCount} r)</Text>}
          </Text>
          <Text style={styles.statSub}>Awaiting Review</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          onPress={onAddLog}
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          activeOpacity={0.85}
        >
          <View style={styles.actionBtnContent}>
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="edit-note" size={22} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.actionBtnTitle}>Add Today's Log</Text>
              <Text style={styles.actionBtnSub}>Analyze entry quality with AI</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#95d4ac" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onJoinCall}
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          activeOpacity={0.85}
        >
          <View style={styles.actionBtnContent}>
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(250, 189, 0, 0.1)' }]}>
              <MaterialIcons name="videocam" size={22} color="#fabd00" />
            </View>
            <View>
              <Text style={[styles.actionBtnTitle, { color: '#ffffff' }]}>Join Live Call</Text>
              <Text style={styles.actionBtnSub}>Connect WebRTC stream</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#fabd00" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1511',
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#77da9f',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1b211d',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0c9c0',
  },
  led: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ledYellow: {
    backgroundColor: '#fabd00',
  },
  gaugeCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#0a100c',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#198754',
    borderRadius: 5,
  },
  gaugeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#77da9f',
  },
  gaugeSubText: {
    fontSize: 11,
    color: '#c0c9c0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#c0c9c0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#95d4ac',
  },
  rejectedSub: {
    fontSize: 11,
    color: '#ffb4ab',
  },
  statSub: {
    fontSize: 8,
    color: '#c0c9c0',
  },
  actionGrid: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  actionBtnPrimary: {
    borderColor: '#0f5132',
  },
  actionBtnSecondary: {
    borderColor: '#ab8100',
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(25, 135, 84, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionBtnSub: {
    fontSize: 10,
    color: '#c0c9c0',
    marginTop: 2,
  },
});

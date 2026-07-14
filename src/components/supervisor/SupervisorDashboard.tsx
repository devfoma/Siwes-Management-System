import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';
import type { LogbookEntry } from '../../interfaces/types';

interface SupervisorDashboardProps {
  onSelectStudent: (studentId: string) => void;
  onJoinCall: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onSelectStudent,
  onJoinCall,
}) => {
  const { logbookEntries, supervisionSessions, studentProfile } = useSIWES();

  const totalAssigned = 1;
  const pendingReviews = logbookEntries.filter((e) => e.supervisorStatus === 'PENDING').length;
  const scheduledCalls = supervisionSessions.filter((s) => s.sessionStatus === 'SCHEDULED').length;

  const latestEntry: LogbookEntry | undefined = logbookEntries[0];
  let healthIndicator: 'CRITICAL' | 'WARNING' | 'COMPLIANT' = 'COMPLIANT';
  if (latestEntry) {
    if (latestEntry.aiStatus === 'CRITICAL') healthIndicator = 'CRITICAL';
    else if (latestEntry.aiStatus === 'WARNING') healthIndicator = 'WARNING';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome headers */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.subText}>Coordinator Portal</Text>
          <Text style={styles.welcomeText}>Welcome, Dr. Charity</Text>
        </View>
        <View style={styles.systemBadge}>
          <View style={[styles.led, styles.ledGreen]} />
          <Text style={styles.systemBadgeText}>Live Supervision Hub</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <MaterialIcons name="people" size={20} color="#95d4ac" />
          <Text style={styles.metricLabel}>Assigned</Text>
          <Text style={styles.metricValue}>{totalAssigned}</Text>
          <Text style={styles.metricSub}>Students</Text>
        </View>

        <View style={styles.metricCard}>
          <MaterialIcons name="pending-actions" size={20} color="#fabd00" />
          <Text style={styles.metricLabel}>Pending</Text>
          <Text style={[styles.metricValue, { color: '#fabd00' }]}>{pendingReviews}</Text>
          <Text style={styles.metricSub}>Logbooks</Text>
        </View>

        <View style={styles.metricCard}>
          <MaterialIcons name="videocam" size={20} color="#77da9f" />
          <Text style={styles.metricLabel}>Calls</Text>
          <Text style={[styles.metricValue, { color: '#77da9f' }]}>{scheduledCalls}</Text>
          <Text style={styles.metricSub}>Scheduled</Text>
        </View>
      </View>

      {/* Directory list container */}
      <View style={styles.directoryCard}>
        <View style={styles.directoryHeader}>
          <Text style={styles.directoryTitle}>Student Monitoring Directory</Text>
          <Text style={styles.sortIndicator}>Sort: Latest Log</Text>
        </View>

        <View style={styles.studentCard}>
          <View style={styles.studentInfoRow}>
            {/* Image mock badge */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>FA</Text>
            </View>

            <View style={styles.studentMeta}>
              <View style={styles.studentNameRow}>
                <Text style={styles.studentName}>Faith Amarachi</Text>
                <Text style={styles.matricNo}>({studentProfile.matricNo})</Text>
              </View>
              <Text style={styles.deptText}>Dept: {studentProfile.department}</Text>
              <Text style={styles.placementText}>Firm: {studentProfile.organizationName}</Text>
            </View>
          </View>

          {/* Status Indicators and Switcher Controls */}
          <View style={styles.divider} />
          
          <View style={styles.actionsRow}>
            <View style={styles.statusGroup}>
              <Text style={styles.statusLabel}>AI Status:</Text>
              <View style={styles.healthBadge}>
                <View
                  style={[
                    styles.ledIndicator,
                    healthIndicator === 'COMPLIANT'
                      ? styles.ledGreen
                      : healthIndicator === 'WARNING'
                      ? styles.ledYellow
                      : styles.ledRed,
                  ]}
                />
                <Text style={styles.healthText}>{healthIndicator}</Text>
              </View>
            </View>

            <View style={styles.btnGroup}>
              <TouchableOpacity onPress={onJoinCall} style={styles.callBtn} activeOpacity={0.8}>
                <MaterialIcons name="videocam" size={14} color="#261a00" />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onSelectStudent(studentProfile.id)}
                style={styles.reviewBtn}
                activeOpacity={0.8}
              >
                <MaterialIcons name="rate-review" size={14} color="#ffffff" />
                <Text style={styles.reviewBtnText}>Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  ledGreen: {
    backgroundColor: '#77da9f',
  },
  ledYellow: {
    backgroundColor: '#fabd00',
  },
  ledRed: {
    backgroundColor: '#ffb4ab',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#c0c9c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#95d4ac',
  },
  metricSub: {
    fontSize: 9,
    color: '#c0c9c0',
  },
  directoryCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 16,
  },
  directoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
    marginBottom: 16,
  },
  directoryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c0c9c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortIndicator: {
    fontSize: 9,
    color: '#c0c9c0',
  },
  studentCard: {
    backgroundColor: '#0a100c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    gap: 12,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#171d19',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0f5132',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#95d4ac',
  },
  studentMeta: {
    flex: 1,
    gap: 2,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  matricNo: {
    fontSize: 10,
    color: '#c0c9c0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  deptText: {
    fontSize: 11,
    color: '#c0c9c0',
  },
  placementText: {
    fontSize: 11,
    color: '#c0c9c0',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 10,
    color: '#c0c9c0',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  ledIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffc107',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#8a6804',
  },
  callBtnText: {
    color: '#261a00',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#198754',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#082d1c',
  },
  reviewBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

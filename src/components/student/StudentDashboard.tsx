import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';
import { formatDate } from '../../utils/helpers';
import type { LogbookEntry } from '../../interfaces/types';

interface StudentDashboardProps {
  onAddLog: () => void;
  onJoinCall: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onAddLog, onJoinCall }) => {
  const { logbookEntries } = useSIWES();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const totalDays = 90;
  const completedDays = logbookEntries.length + 42;
  const percentage = Math.min(Math.round((completedDays / totalDays) * 100), 100);

  const approvedCount = logbookEntries.filter(e => e.supervisorStatus === 'APPROVED').length + 11;
  const pendingCount = logbookEntries.filter(e => e.supervisorStatus === 'PENDING').length;
  const rejectedCount = logbookEntries.filter(e => e.supervisorStatus === 'REJECTED').length;

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome & Info */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.subText}>Operational Dashboard</Text>
          <Text style={styles.welcomeText}>Welcome, Faith</Text>
        </View>
        <View style={styles.systemBadge}>
          <View style={[styles.led, styles.ledYellow]} />
          <Text style={styles.systemBadgeText}>Week 8 Online</Text>
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

      {/* Log history list */}
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Logbook Entry History</Text>

        <View style={styles.listContainer}>
          {logbookEntries.map(entry => {
            const isExpanded = expandedLogId === entry.id;
            return (
              <TouchableOpacity
                key={entry.id}
                onPress={() => toggleExpandLog(entry.id)}
                style={styles.historyRow}
                activeOpacity={0.9}
              >
                <View style={styles.rowHeader}>
                  <View style={styles.rowLeft}>
                    <View
                      style={[
                        styles.indicatorLED,
                        entry.aiStatus === 'COMPLIANT'
                          ? styles.ledGreen
                          : entry.aiStatus === 'WARNING'
                          ? styles.ledYellow
                          : styles.ledRed,
                      ]}
                    />
                    <Text style={styles.rowDate}>{formatDate(entry.entryDate)}</Text>
                  </View>

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        entry.aiStatus === 'COMPLIANT'
                          ? styles.badgeGreen
                          : entry.aiStatus === 'WARNING'
                          ? styles.badgeYellow
                          : styles.badgeRed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          entry.aiStatus === 'COMPLIANT'
                            ? { color: '#77da9f' }
                            : entry.aiStatus === 'WARNING'
                            ? { color: '#fabd00' }
                            : { color: '#ffb4ab' },
                        ]}
                      >
                        AI: {entry.aiStatus}
                      </Text>
                    </View>
                    
                    <View style={styles.statusBadge}>
                      <Text style={[styles.badgeText, { color: '#c0c9c0' }]}>
                        {entry.supervisorStatus}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.rowSnippet} numberOfLines={isExpanded ? undefined : 2}>
                  {entry.tasksPerformed}
                </Text>

                {isExpanded && (
                  <View style={styles.expandedDetails}>
                    <View style={styles.detailsSplit}>
                      <View style={styles.detailsBlock}>
                        <Text style={styles.detailsBlockLabel}>Tasks Performed</Text>
                        <Text style={styles.detailsBlockValue}>{entry.tasksPerformed}</Text>
                      </View>
                      <View style={styles.detailsBlock}>
                        <Text style={styles.detailsBlockLabel}>Skills Acquired</Text>
                        <Text style={styles.detailsBlockValue}>{entry.skillsAcquired}</Text>
                      </View>
                    </View>

                    {entry.aiDetails && (
                      <View style={styles.aiResultBlock}>
                        <Text style={styles.aiBlockTitle}>Gemma AI Assessment</Text>
                        <Text style={styles.aiDetailsText}>
                          Quality: {entry.aiDetails.qualityRating}
                        </Text>
                        {entry.aiDetails.flags.map((flag, idx) => (
                          <Text key={idx} style={styles.flagText}>
                            ⚠️ {flag}
                          </Text>
                        ))}
                      </View>
                    )}

                    {entry.supervisorFeedback && (
                      <View style={styles.feedbackBlock}>
                        <Text style={styles.feedbackLabel}>Supervisor Feedback</Text>
                        <Text style={styles.feedbackText}>"{entry.supervisorFeedback}"</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  ledYellow: {
    backgroundColor: '#fabd00',
  },
  gaugeCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c0c9c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  gaugeContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#0a100c',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fabd00',
    borderRadius: 6,
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    width: 45,
    textAlign: 'right',
  },
  gaugeSubText: {
    fontSize: 11,
    color: '#c0c9c0',
    marginTop: 10,
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
    fontSize: 8,
    fontWeight: '700',
    color: '#c0c9c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#95d4ac',
  },
  rejectedSub: {
    fontSize: 10,
    color: '#ffb4ab',
  },
  statSub: {
    fontSize: 9,
    color: '#c0c9c0',
    textAlign: 'center',
  },
  actionGrid: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1b211d',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  actionBtnPrimary: {
    borderColor: '#0f5132',
  },
  actionBtnSecondary: {
    borderColor: '#ffc107',
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(149, 212, 172, 0.1)',
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
  },
  historyCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 16,
  },
  historyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c0c9c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
    marginBottom: 12,
  },
  listContainer: {
    gap: 10,
  },
  historyRow: {
    backgroundColor: '#0a100c',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorLED: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ledGreen: {
    backgroundColor: '#77da9f',
  },
  ledRed: {
    backgroundColor: '#ffb4ab',
  },
  rowDate: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeGreen: {
    backgroundColor: 'rgba(119, 218, 159, 0.1)',
    borderColor: 'rgba(119, 218, 159, 0.2)',
  },
  badgeYellow: {
    backgroundColor: 'rgba(250, 189, 0, 0.1)',
    borderColor: 'rgba(250, 189, 0, 0.2)',
  },
  badgeRed: {
    backgroundColor: 'rgba(255, 180, 171, 0.1)',
    borderColor: 'rgba(255, 180, 171, 0.2)',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  rowSnippet: {
    fontSize: 11,
    color: '#c0c9c0',
    lineHeight: 15,
  },
  expandedDetails: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
    gap: 10,
  },
  detailsSplit: {
    gap: 8,
  },
  detailsBlock: {
    gap: 2,
  },
  detailsBlockLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  detailsBlockValue: {
    fontSize: 11,
    color: '#c0c9c0',
    lineHeight: 15,
  },
  aiResultBlock: {
    backgroundColor: 'rgba(149, 212, 172, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(149, 212, 172, 0.15)',
    borderRadius: 6,
    padding: 8,
    gap: 4,
  },
  aiBlockTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#77da9f',
    textTransform: 'uppercase',
  },
  aiDetailsText: {
    fontSize: 10,
    color: '#ffffff',
  },
  flagText: {
    fontSize: 9,
    color: '#ffb4ab',
  },
  feedbackBlock: {
    backgroundColor: 'rgba(250, 189, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(250, 189, 0, 0.15)',
    borderRadius: 6,
    padding: 8,
    gap: 2,
  },
  feedbackLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fabd00',
    textTransform: 'uppercase',
  },
  feedbackText: {
    fontSize: 10,
    color: '#ffffff',
    fontStyle: 'italic',
  },
});

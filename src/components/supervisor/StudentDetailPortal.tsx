import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';
import { formatDate } from '../../utils/helpers';
import type { LogbookEntry } from '../../interfaces/types';

interface StudentDetailPortalProps {
  onBack: () => void;
}

export const StudentDetailPortal: React.FC<StudentDetailPortalProps> = ({ onBack }) => {
  const { studentProfile, logbookEntries, updateLogbookStatus } = useSIWES();
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(logbookEntries[0] || null);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const handleSelectEntry = (entry: LogbookEntry) => {
    setSelectedEntry(entry);
    setFeedbackText(entry.aiDetails?.suggestedComment || '');
  };

  const handleApprove = () => {
    if (!selectedEntry) return;
    updateLogbookStatus(selectedEntry.id, 'APPROVED', feedbackText);
    setSelectedEntry(prev => prev ? { ...prev, supervisorStatus: 'APPROVED', supervisorFeedback: feedbackText } : null);
  };

  const handleReject = () => {
    if (!selectedEntry) return;
    updateLogbookStatus(selectedEntry.id, 'REJECTED', feedbackText);
    setSelectedEntry(prev => prev ? { ...prev, supervisorStatus: 'REJECTED', supervisorFeedback: feedbackText } : null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header controls */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={18} color="#c0c9c0" />
          <Text style={styles.backBtnText}>Directory</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Verify Logs</Text>
      </View>

      {/* Geolocation check box */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Placement & Geolocation Verification</Text>
        <View style={styles.recessedMap}>
          <MaterialIcons name="location-on" size={24} color="#77da9f" />
          <Text style={styles.mapText}>Stitch Emerald Technologies Office Node</Text>
          <Text style={styles.coordsText}>
            Lat: {studentProfile.latitude}, Lon: {studentProfile.longitude}
          </Text>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>MATCH VERIFIED</Text>
          </View>
        </View>
      </View>

      {/* Submissions List & Active Log Details */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Weekly Log Submission Timeline</Text>
        
        {/* Horizontal timeline of submissions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineRow}>
          {logbookEntries.map(entry => {
            const isSelected = selectedEntry?.id === entry.id;
            return (
              <TouchableOpacity
                key={entry.id}
                onPress={() => handleSelectEntry(entry)}
                style={[styles.timelineChip, isSelected && styles.timelineChipSelected]}
                activeOpacity={0.8}
              >
                <Text style={[styles.timelineChipText, isSelected && styles.timelineChipTextSelected]}>
                  {formatDate(entry.entryDate)}
                </Text>
                <View
                  style={[
                    styles.ledMini,
                    entry.aiStatus === 'COMPLIANT'
                      ? styles.ledGreen
                      : entry.aiStatus === 'WARNING'
                      ? styles.ledYellow
                      : styles.ledRed,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {selectedEntry ? (
        <View style={styles.card}>
          <View style={styles.logHeader}>
            <Text style={styles.logDateText}>{formatDate(selectedEntry.entryDate)}</Text>
            <View style={styles.statusLabelRow}>
              <Text style={styles.statusLabelText}>Status: {selectedEntry.supervisorStatus}</Text>
            </View>
          </View>

          <View style={styles.detailsGroup}>
            <Text style={styles.detailTitle}>Tasks Performed</Text>
            <Text style={styles.detailContentText}>{selectedEntry.tasksPerformed}</Text>
          </View>

          <View style={styles.detailsGroup}>
            <Text style={styles.detailTitle}>Skills Configured</Text>
            <Text style={styles.detailContentText}>{selectedEntry.skillsAcquired}</Text>
          </View>

          {/* AI Metrics block */}
          {selectedEntry.aiDetails && (
            <View style={styles.aiReviewBlock}>
              <View style={styles.aiHeader}>
                <MaterialIcons name="smart-toy" size={16} color="#77da9f" />
                <Text style={styles.aiBlockTitle}>Gemma 2B AI Diagnostics</Text>
              </View>

              <Text style={styles.aiQualityGrade}>
                Quality Grade: <Text style={styles.aiGradeValue}>{selectedEntry.aiDetails.qualityRating}</Text>
              </Text>

              {selectedEntry.aiDetails.flags.map((flag, idx) => (
                <Text key={idx} style={styles.flagText}>
                  ⚠️ {flag}
                </Text>
              ))}
            </View>
          )}

          {/* Supervisor verification actions */}
          <View style={styles.reviewActions}>
            <Text style={styles.actionLabel}>Feedback / Comment</Text>
            <View style={styles.feedbackInputContainer}>
              <TextInput
                value={feedbackText}
                onChangeText={setFeedbackText}
                placeholder="Type coordinator comment..."
                placeholderTextColor="#666"
                style={styles.feedbackInput}
              />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity onPress={handleReject} style={styles.rejectBtn} activeOpacity={0.8}>
                <Text style={styles.rejectBtnText}>Request Revision</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleApprove} style={styles.approveBtn} activeOpacity={0.8}>
                <Text style={styles.approveBtnText}>Approve Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Select an entry from the timeline to review.</Text>
        </View>
      )}
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
    gap: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 12,
    color: '#c0c9c0',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    paddingBottom: 6,
  },
  recessedMap: {
    backgroundColor: '#0a100c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  mapText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coordsText: {
    fontSize: 10,
    color: '#c0c9c0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  verifiedTag: {
    backgroundColor: 'rgba(119, 218, 159, 0.12)',
    borderWidth: 1,
    borderColor: '#77da9f',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  verifiedTagText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#77da9f',
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0a100c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  timelineChipSelected: {
    borderColor: '#95d4ac',
    backgroundColor: 'rgba(149, 212, 172, 0.1)',
  },
  timelineChipText: {
    fontSize: 11,
    color: '#c0c9c0',
  },
  timelineChipTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  ledMini: {
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
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 6,
  },
  logDateText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusLabelRow: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusLabelText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  detailsGroup: {
    gap: 4,
  },
  detailTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detailContentText: {
    fontSize: 11,
    color: '#c0c9c0',
    backgroundColor: '#0a100c',
    padding: 8,
    borderRadius: 6,
    lineHeight: 16,
  },
  aiReviewBlock: {
    backgroundColor: 'rgba(149, 212, 172, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(149, 212, 172, 0.12)',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 4,
  },
  aiBlockTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#77da9f',
    textTransform: 'uppercase',
  },
  aiQualityGrade: {
    fontSize: 10,
    color: '#c0c9c0',
  },
  aiGradeValue: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  flagText: {
    fontSize: 9,
    color: '#ffb4ab',
  },
  reviewActions: {
    gap: 6,
    marginTop: 6,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  feedbackInputContainer: {
    backgroundColor: '#0a100c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    height: 40,
    justifyContent: 'center',
  },
  feedbackInput: {
    color: '#ffffff',
    fontSize: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  rejectBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#69101a',
  },
  rejectBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  approveBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#198754',
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#082d1c',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#c0c9c0',
  },
});

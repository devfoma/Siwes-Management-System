import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';
import { formatDate } from '../../utils/helpers';
import type { LogbookEntry } from '../../interfaces/types';

interface DailyLogsTabProps {
  onAddLog: () => void;
}

export const DailyLogsTab: React.FC<DailyLogsTabProps> = ({ onAddLog }) => {
  const { logbookEntries, studentProfile } = useSIWES();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Export states
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string>('');

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const handleExportReport = async () => {
    if (logbookEntries.length === 0) {
      Alert.alert('No Logs Found', 'Add some logbook entries first before compiling reports.');
      return;
    }

    // Generate plain-text document style SIWES log export
    let doc = `=========================================\n`;
    doc += `      SIWES SYSTEM LOG REPORT EXPORT     \n`;
    doc += `=========================================\n`;
    doc += `STUDENT: ${studentProfile.fullName}\n`;
    doc += `MATRIC NO: ${studentProfile.matricNo}\n`;
    doc += `DEPARTMENT: ${studentProfile.department}\n`;
    doc += `ORGANIZATION: ${studentProfile.organizationName}\n`;
    doc += `EXPORT DATE: ${new Date().toISOString().split('T')[0]}\n`;
    doc += `=========================================\n\n`;

    logbookEntries.forEach((entry, idx) => {
      doc += `LOG ENTRY #${idx + 1} - [${formatDate(entry.entryDate)}]\n`;
      doc += `-----------------------------------------\n`;
      doc += `TASKS: ${entry.tasksPerformed}\n`;
      doc += `SKILLS ACQUIRED: ${entry.skillsAcquired}\n`;
      doc += `AI DIAGNOSTIC: ${entry.aiStatus} (Grade: ${entry.aiDetails?.qualityRating || 'N/A'})\n`;
      doc += `SUPERVISOR VERIFICATION: ${entry.supervisorStatus}\n`;
      if (entry.supervisorFeedback) {
        doc += `FEEDBACK: "${entry.supervisorFeedback}"\n`;
      }
      doc += `\n`;
    });

    doc += `=========================================\n`;
    doc += `       END OF SIWES LOGBOOK EXPORT       \n`;
    doc += `=========================================\n`;

    setReportContent(doc);
    setExportModalVisible(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: reportContent,
        title: 'SIWES Logbook Report Export',
      });
    } catch (error: any) {
      Alert.alert('Error sharing', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Daily Log Submissions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleExportReport} style={styles.exportBtn} activeOpacity={0.8}>
            <MaterialIcons name="ios-share" size={14} color="#261a00" />
            <Text style={styles.exportText}>Export Report</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onAddLog} style={styles.addBtn} activeOpacity={0.8}>
            <MaterialIcons name="add" size={14} color="#ffffff" />
            <Text style={styles.addText}>New Log</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {logbookEntries.map((entry) => {
          const isExpanded = expandedLogId === entry.id;
          return (
            <View key={entry.id} style={styles.logCard}>
              <TouchableOpacity
                onPress={() => toggleExpandLog(entry.id)}
                style={styles.cardHeader}
                activeOpacity={0.9}
              >
                <View>
                  <Text style={styles.dateText}>{formatDate(entry.entryDate)}</Text>
                  <Text numberOfLines={1} style={styles.summarySnippet}>
                    {entry.tasksPerformed}
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  {/* AI Status led */}
                  <View
                    style={[
                      styles.ledIndicator,
                      entry.aiStatus === 'COMPLIANT'
                        ? styles.ledGreen
                        : entry.aiStatus === 'WARNING'
                        ? styles.ledYellow
                        : styles.ledRed,
                    ]}
                  />
                  {/* Supervisor verification tag */}
                  <View
                    style={[
                      styles.tag,
                      entry.supervisorStatus === 'APPROVED'
                        ? styles.tagGreen
                        : entry.supervisorStatus === 'REJECTED'
                        ? styles.tagRed
                        : styles.tagYellow,
                    ]}
                  >
                    <Text style={styles.tagText}>{entry.supervisorStatus}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  
                  <View style={styles.infoGroup}>
                    <Text style={styles.infoLabel}>Tasks Executed</Text>
                    <Text style={styles.infoText}>{entry.tasksPerformed}</Text>
                  </View>

                  <View style={styles.infoGroup}>
                    <Text style={styles.infoLabel}>Technological Skills Configured</Text>
                    <Text style={styles.infoText}>{entry.skillsAcquired}</Text>
                  </View>

                  {/* AI Diagnostics details */}
                  {entry.aiDetails && (
                    <View style={styles.aiResultBox}>
                      <View style={styles.aiHeader}>
                        <MaterialIcons name="smart-toy" size={14} color="#77da9f" />
                        <Text style={styles.aiTitle}>Gemma AI Quality Evaluation</Text>
                      </View>
                      <Text style={styles.aiText}>
                        • Grade: <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>{entry.aiDetails.qualityRating}</Text>
                      </Text>
                      {entry.aiDetails.flags.map((flag, idx) => (
                        <Text key={idx} style={styles.flagText}>
                          ⚠️ {flag}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Coordinator feedback */}
                  {entry.supervisorFeedback && (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackHeader}>Coordinator Comment:</Text>
                      <Text style={styles.feedbackText}>"{entry.supervisorFeedback}"</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Export Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SIWES Connect Export Report</Text>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <MaterialIcons name="close" size={20} color="#c0c9c0" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reportScroll}>
              <Text style={styles.reportCode}>{reportContent}</Text>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setExportModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={styles.shareBtn}
              >
                <MaterialIcons name="share" size={14} color="#ffffff" />
                <Text style={styles.shareBtnText}>Share / Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1511',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exportBtn: {
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
  exportText: {
    color: '#261a00',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  addBtn: {
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
  addText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  logCard: {
    backgroundColor: '#1b211d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f5132',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summarySnippet: {
    fontSize: 10,
    color: '#c0c9c0',
    width: 200,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ledIndicator: {
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
  tag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  tagGreen: {
    backgroundColor: 'rgba(25, 135, 84, 0.1)',
    borderColor: '#198754',
  },
  tagYellow: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: '#ffc107',
  },
  tagRed: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderColor: '#dc3545',
  },
  tagText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  expandedContent: {
    padding: 12,
    paddingTop: 0,
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  infoGroup: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#77da9f',
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 11,
    color: '#c0c9c0',
    lineHeight: 15,
  },
  aiResultBox: {
    backgroundColor: '#0a100c',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(149, 212, 172, 0.1)',
    gap: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#77da9f',
    textTransform: 'uppercase',
  },
  aiText: {
    fontSize: 10,
    color: '#c0c9c0',
  },
  flagText: {
    fontSize: 9,
    color: '#ffb4ab',
  },
  feedbackBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.12)',
    borderRadius: 6,
    padding: 8,
    gap: 2,
  },
  feedbackHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffc107',
  },
  feedbackText: {
    fontSize: 10,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reportScroll: {
    backgroundColor: '#0a100c',
    borderRadius: 8,
    padding: 12,
  },
  reportCode: {
    color: '#77da9f',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  closeBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#343a40',
    borderRadius: 6,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  shareBtn: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#198754',
    borderRadius: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#082d1c',
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

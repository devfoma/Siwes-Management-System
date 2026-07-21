import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';
import { analyzeLogbookEntry, type AIAnalysisResult } from '../../services/aiService';

interface LogbookFormProps {
  onBack: () => void;
}

export const LogbookForm: React.FC<LogbookFormProps> = ({ onBack }) => {
  const { addLogbookEntry } = useSIWES();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiChecked, setAiChecked] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const handleAIReview = async () => {
    if (!tasks.trim()) {
      setErrorMsg('Please write some details in the tasks performed text box first.');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeLogbookEntry(tasks, skills);
      setAiResult(result);
      setAiChecked(true);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error evaluating entry with the AI service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!tasks.trim() || !skills.trim()) {
      setErrorMsg('All fields are required. Please fill in tasks performed and skills.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await addLogbookEntry(tasks, skills, date, imageUrl.trim() || undefined, aiResult || undefined);
      setSuccessMsg(true);
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error submitting logbook entry.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={18} color="#c0c9c0" />
          <Text style={styles.backBtnText}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Logbook Entry</Text>
      </View>

      {successMsg ? (
        <View style={styles.successCard}>
          <MaterialIcons name="check-circle" size={48} color="#77da9f" style={styles.successIcon} />
          <Text style={styles.successTitle}>Logbook Submitted!</Text>
          <Text style={styles.successDesc}>
            Your daily entry has been recorded. It is now pending supervisor verification.
          </Text>
        </View>
      ) : (
        <View style={styles.formCard}>
          {/* Date Row */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Log Entry Date</Text>
            <View style={styles.recessedInput}>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Workplace Evidence URL</Text>
            <View style={styles.recessedInput}>
              <TextInput
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://example.com/photo-or-document.jpg"
                placeholderTextColor="#666"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Tasks Performed */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detailed Tasks Performed</Text>
            <View style={[styles.recessedInput, styles.textAreaContainer]}>
              <TextInput
                multiline
                numberOfLines={5}
                value={tasks}
                onChangeText={(text) => {
                  setTasks(text);
                  if (aiChecked) setAiChecked(false);
                }}
                placeholder="Describe your tasks, tools configured, protocols tested, or troubleshooting steps taken..."
                placeholderTextColor="#666"
                style={[styles.textInput, styles.textArea]}
              />
            </View>
          </View>

          {/* Skills Acquired */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skills & Technologies Utilized</Text>
            <View style={styles.recessedInput}>
              <TextInput
                value={skills}
                onChangeText={(text) => {
                  setSkills(text);
                  if (aiChecked) setAiChecked(false);
                }}
                placeholder="e.g. React Native, WebRTC, LAN Cable Crimping"
                placeholderTextColor="#666"
                style={styles.textInput}
              />
            </View>
          </View>

          {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleAIReview}
              style={styles.aiBtn}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#261a00" />
              ) : (
                <>
                  <MaterialIcons name="smart-toy" size={16} color="#261a00" />
                  <Text style={styles.aiBtnText}>Review with AI</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSubmit} 
              style={styles.submitBtn} 
              activeOpacity={0.8}
              disabled={isSubmitting || isAnalyzing}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#0f1511" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Entry</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Helper Box */}
          {aiChecked && aiResult && (
            <View style={styles.aiHelperBox}>
              <View style={styles.aiHeader}>
                <MaterialIcons name="psychology" size={16} color="#77da9f" />
                <Text style={styles.aiTitle}>AI Evaluator Output</Text>
              </View>

              <View style={styles.aiMeta}>
                <Text style={styles.aiMetaLabel}>Quality Score:</Text>
                <View
                  style={[
                    styles.qualityTag,
                    aiResult.qualityRating === 'Good'
                      ? styles.tagGreen
                      : aiResult.qualityRating === 'Medium'
                      ? styles.tagYellow
                      : styles.tagRed,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      aiResult.qualityRating === 'Good'
                        ? { color: '#77da9f' }
                        : aiResult.qualityRating === 'Medium'
                        ? { color: '#fabd00' }
                        : { color: '#ffb4ab' },
                    ]}
                  >
                    {aiResult.qualityRating}
                  </Text>
                </View>
              </View>

              {aiResult.technicalSkills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={styles.sectionLabel}>Skills Extracted:</Text>
                  <View style={styles.skillsWrap}>
                    {aiResult.technicalSkills.map((sk, idx) => (
                      <View key={idx} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{sk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {aiResult.flags.length > 0 && (
                <View style={styles.flagsSection}>
                  <Text style={styles.sectionLabel}>AI Warnings:</Text>
                  {aiResult.flags.map((flag, idx) => (
                    <Text key={idx} style={styles.flagItemText}>
                      ⚠️ {flag}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.commentSection}>
                <Text style={styles.sectionLabel}>Draft Coordinator Comment:</Text>
                <Text style={styles.commentText}>"{aiResult.suggestedComment}"</Text>
              </View>
            </View>
          )}
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
  successCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#77da9f',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  successDesc: {
    fontSize: 12,
    color: '#c0c9c0',
    textAlign: 'center',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  recessedInput: {
    backgroundColor: '#0a100c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 13,
    height: 40,
  },
  textAreaContainer: {
    paddingVertical: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  recessedImageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a100c',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  imageBadgeText: {
    flex: 1,
    fontSize: 12,
    color: '#c0c9c0',
  },
  attachedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#77da9f',
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 11,
    color: '#ffb4ab',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  aiBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffc107',
    borderRadius: 8,
    height: 44,
    borderBottomWidth: 3,
    borderBottomColor: '#8a6804',
  },
  aiBtnText: {
    color: '#261a00',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  submitBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#198754',
    borderRadius: 8,
    height: 44,
    borderBottomWidth: 3,
    borderBottomColor: '#082d1c',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  aiHelperBox: {
    backgroundColor: 'rgba(149, 212, 172, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(149, 212, 172, 0.12)',
    borderRadius: 8,
    padding: 12,
    gap: 10,
    marginTop: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 6,
  },
  aiTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#77da9f',
    textTransform: 'uppercase',
  },
  aiMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiMetaLabel: {
    fontSize: 10,
    color: '#c0c9c0',
  },
  qualityTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagGreen: {
    backgroundColor: 'rgba(119, 218, 159, 0.1)',
    borderColor: 'rgba(119, 218, 159, 0.2)',
  },
  tagYellow: {
    backgroundColor: 'rgba(250, 189, 0, 0.1)',
    borderColor: 'rgba(250, 189, 0, 0.2)',
  },
  tagRed: {
    backgroundColor: 'rgba(255, 180, 171, 0.1)',
    borderColor: 'rgba(255, 180, 171, 0.2)',
  },
  tagText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  skillsSection: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: 'rgba(149, 212, 172, 0.1)',
    borderColor: 'rgba(149, 212, 172, 0.2)',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  skillChipText: {
    color: '#95d4ac',
    fontSize: 9,
  },
  flagsSection: {
    gap: 4,
  },
  flagItemText: {
    fontSize: 10,
    color: '#ffb4ab',
  },
  commentSection: {
    gap: 4,
  },
  commentText: {
    fontSize: 10,
    color: '#ffffff',
    fontStyle: 'italic',
    backgroundColor: '#0a100c',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
});

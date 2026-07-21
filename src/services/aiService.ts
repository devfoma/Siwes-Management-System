import type { AIStatus } from '../interfaces/types';

export interface AIAnalysisResult {
  qualityRating: 'Poor' | 'Medium' | 'Good';
  technicalSkills: string[];
  flags: string[];
  suggestedComment: string;
  summary: string;
  status: AIStatus;
}

const AI_ANALYSIS_URL = process.env.EXPO_PUBLIC_AI_ANALYSIS_URL;

export async function analyzeLogbookEntry(
  tasksPerformed: string,
  skillsAcquired: string
): Promise<AIAnalysisResult> {
  if (!AI_ANALYSIS_URL) {
    throw new Error('AI analysis service is not configured. Set EXPO_PUBLIC_AI_ANALYSIS_URL.');
  }

  const response = await fetch(AI_ANALYSIS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tasksPerformed,
      skillsAcquired,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI analysis failed with status ${response.status}.`);
  }

  const result = await response.json();
  return {
    qualityRating: result.qualityRating,
    technicalSkills: Array.isArray(result.technicalSkills) ? result.technicalSkills : [],
    flags: Array.isArray(result.flags) ? result.flags : [],
    suggestedComment: result.suggestedComment || '',
    summary: result.summary || 'AI analysis completed.',
    status: result.status || mapQualityToStatus(result.qualityRating),
  };
}

function mapQualityToStatus(qualityRating: AIAnalysisResult['qualityRating']): AIStatus {
  if (qualityRating === 'Poor') return 'CRITICAL';
  if (qualityRating === 'Medium') return 'WARNING';
  return 'COMPLIANT';
}

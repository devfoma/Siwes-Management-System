import { Platform } from 'react-native';

export interface AIAnalysisResult {
  qualityRating: 'Poor' | 'Medium' | 'Good';
  technicalSkills: string[];
  flags: string[];
  suggestedComment: string;
}

// Heuristic rule-based fallback when Ollama is offline or model is not ready
export function analyzeLogbookWithGemmaHeuristic(tasks: string, skills: string): AIAnalysisResult {
  const combinedText = `${tasks} ${skills}`.toLowerCase();
  const wordCount = tasks.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const technicalKeywords = [
    { key: 'react', label: 'React.js Frontend Development' },
    { key: 'native', label: 'React Native Mobile Development' },
    { key: 'tailwind', label: 'Tailwind CSS Responsive Design' },
    { key: 'sql', label: 'Database Design & SQL Queries' },
    { key: 'postgres', label: 'PostgreSQL Relational DB' },
    { key: 'api', label: 'REST API Design & Integration' },
    { key: 'node', label: 'Node.js Backend Services' },
    { key: 'express', label: 'Express.js Routing' },
    { key: 'git', label: 'Version Control (Git)' },
    { key: 'socket', label: 'WebSockets Real-time Communication' },
    { key: 'webrtc', label: 'WebRTC P2P Video Streaming' },
    { key: 'python', label: 'Python Scripting & Automation' },
    { key: 'docker', label: 'Docker Containerization' },
    { key: 'aws', label: 'AWS Cloud Infrastructure' },
    { key: 'network', label: 'Computer Network Configuration' },
    { key: 'router', label: 'Router & Switch Configuration' },
    { key: 'cable', label: 'LAN Cable Crimping & Testing' },
    { key: 'troubleshoot', label: 'Hardware Troubleshooting' }
  ];

  const extractedSkills: string[] = [];
  technicalKeywords.forEach(item => {
    if (combinedText.includes(item.key)) {
      extractedSkills.push(item.label);
    }
  });

  if (extractedSkills.length === 0 && wordCount > 2) {
    extractedSkills.push('General IT Support');
    extractedSkills.push('Technical Documentation');
  }

  let qualityRating: 'Poor' | 'Medium' | 'Good' = 'Good';
  const flags: string[] = [];
  let suggestedComment = '';

  if (wordCount < 10) {
    qualityRating = 'Poor';
    flags.push('Critical: The tasks performed text is extremely short or lacks specific details. (Heuristic)');
    flags.push('Vague Description: Missing key technical terminologies and tools configured. (Heuristic)');
    suggestedComment = 'Please provide a more detailed description of the tasks you performed, highlighting the tools, devices, or protocols you configured.';
  } else if (wordCount < 25) {
    qualityRating = 'Medium';
    flags.push('Warning: Report could be more comprehensive. Elaborate on the tools used. (Heuristic)');
    if (extractedSkills.length < 2) {
      flags.push('Low Detail: Add specific technologies, languages or hardware frameworks utilized. (Heuristic)');
    }
    suggestedComment = 'Good effort. For future entries, try to detail your specific contribution and the tools you employed to accomplish the tasks.';
  } else {
    qualityRating = 'Good';
    if (extractedSkills.length === 0) {
      flags.push('Note: High word count, but few standard technical terms detected. Ensure tech terms are spelled correctly. (Heuristic)');
    }
    suggestedComment = 'Excellent and detailed logbook entry. You demonstrated a clear understanding of the concepts and tools applied. Keep it up!';
  }

  return {
    qualityRating,
    technicalSkills: extractedSkills,
    flags,
    suggestedComment
  };
}

// Get the local Ollama API endpoint based on running environment
export function getOllamaEndpoint(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:11434';
  }
  return 'http://localhost:11434';
}

/**
 * Communicates with the locally installed Ollama instance to analyze the SIWES logbook entry.
 * Uses fallback heuristics if the server is offline or fails to respond.
 */
export async function analyzeLogbookWithGemma(tasks: string, skills: string): Promise<AIAnalysisResult> {
  const baseUri = getOllamaEndpoint();
  const tagsUrl = `${baseUri}/api/tags`;
  const generateUrl = `${baseUri}/api/generate`;

  try {
    const tagsResponse = await fetch(tagsUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!tagsResponse.ok) {
      throw new Error(`Ollama health check failed with status: ${tagsResponse.status}`);
    }

    const tagsData = await tagsResponse.json();
    const models: { name: string }[] = tagsData.models || [];
    
    let selectedModel = 'gemma';
    const gemmaModel = models.find(m => m.name.toLowerCase().includes('gemma'));
    if (gemmaModel) {
      selectedModel = gemmaModel.name;
    } else if (models.length > 0) {
      selectedModel = models[0].name;
    }

    const prompt = `
You are an expert academic supervisor evaluating a student's SIWES (Student Industrial Work Experience Scheme) logbook entry.
Analyze the following daily entry.

Student Entry:
- Tasks Performed: "${tasks}"
- Skills/Technologies Used: "${skills}"

Return a valid JSON object matching this TypeScript structure:
{
  "qualityRating": "Poor" | "Medium" | "Good",
  "technicalSkills": string[],
  "flags": string[],
  "suggestedComment": string
}

Instructions:
- "qualityRating" should be "Poor" if the entry is passive observation or lacks detail (less than 10 words). It should be "Medium" if it is reasonably descriptive but lacks depth. It should be "Good" if it is detailed and outlines active configuration, installation, programming, or troubleshooting.
- "technicalSkills" should contain clean, normalized labels of the practical skills demonstrated (e.g. "WebRTC P2P Video Streaming", "LAN Cable Crimping", "Database Query Optimization").
- "flags" should be a list of warnings or feedback flags. If the entry is weak or lazy, suggest specific technical details they missed.
- "suggestedComment" should be constructive, professional advice for the student's supervisor to submit.

Return ONLY the raw JSON object. Do not wrap in markdown codeblocks. Do not include any pre-text or post-text.
`;

    const generateResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1,
        }
      })
    });

    if (!generateResponse.ok) {
      throw new Error(`Ollama generation failed with status: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    const responseText = generateData.response;

    const parsedResult: AIAnalysisResult = JSON.parse(responseText.trim());
    
    if (
      parsedResult &&
      (parsedResult.qualityRating === 'Poor' || parsedResult.qualityRating === 'Medium' || parsedResult.qualityRating === 'Good') &&
      Array.isArray(parsedResult.technicalSkills) &&
      Array.isArray(parsedResult.flags) &&
      typeof parsedResult.suggestedComment === 'string'
    ) {
      return parsedResult;
    }

    throw new Error('Ollama returned JSON that does not match AIAnalysisResult structure');
  } catch (error) {
    console.warn('Ollama Gemma request failed, falling back to heuristics:', error);
    return analyzeLogbookWithGemmaHeuristic(tasks, skills);
  }
}

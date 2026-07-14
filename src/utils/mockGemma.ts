export interface AIAnalysisResult {
  qualityRating: 'Poor' | 'Medium' | 'Good';
  technicalSkills: string[];
  flags: string[];
  suggestedComment: string;
}

export function analyzeLogbookWithGemma(tasks: string, skills: string): AIAnalysisResult {
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
    flags.push('Critical: The tasks performed text is extremely short or lacks specific details.');
    flags.push('Vague Description: Missing key technical terminologies and tools configured.');
    suggestedComment = 'Please provide a more detailed description of the tasks you performed, highlighting the tools, devices, or protocols you configured.';
  } else if (wordCount < 25) {
    qualityRating = 'Medium';
    flags.push('Warning: Report could be more comprehensive. Elaborate on the tools used.');
    if (extractedSkills.length < 2) {
      flags.push('Low Detail: Add specific technologies, languages or hardware frameworks utilized.');
    }
    suggestedComment = 'Good effort. For future entries, try to detail your specific contribution and the tools you employed to accomplish the tasks.';
  } else {
    qualityRating = 'Good';
    if (extractedSkills.length === 0) {
      flags.push('Note: High word count, but few standard technical terms detected. Ensure tech terms are spelled correctly.');
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

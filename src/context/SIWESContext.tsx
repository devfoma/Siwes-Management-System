import React, { createContext, useContext, useState } from 'react';
import type { UserRole, StudentProfile, SupervisorProfile, LogbookEntry, SupervisionSession, SupervisorStatus, AIStatus } from '../interfaces/types';
import { analyzeLogbookWithGemma } from '../utils/mockGemma';

interface SIWESContextType {
  userRole: UserRole;
  studentProfile: StudentProfile;
  supervisorProfile: SupervisorProfile;
  logbookEntries: LogbookEntry[];
  supervisionSessions: SupervisionSession[];
  toggleUserRole: () => void;
  addLogbookEntry: (tasksPerformed: string, skillsAcquired: string, date: string, imageUrl?: string) => LogbookEntry;
  updateLogbookStatus: (entryId: string, status: SupervisorStatus, feedback: string) => void;
  scheduleSession: (dateTime: string) => void;
}

const initialStudent: StudentProfile = {
  id: 'student-faith',
  userId: 'user-student',
  matricNo: '2022 224 152',
  department: 'Computer Science',
  organizationName: 'Stitch Emerald Technologies',
  organizationAddress: '12 Awolowo Road, Ikoyi, Lagos, Nigeria',
  latitude: 6.4483,
  longitude: 3.4184,
  supervisorId: 'supervisor-charity'
};

const initialSupervisor: SupervisorProfile = {
  id: 'supervisor-charity',
  userId: 'user-supervisor',
  staffId: 'COOU/CS/2018/042',
  department: 'Computer Science',
  designation: 'Senior Lecturer / SIWES Coordinator'
};

const initialLogs: LogbookEntry[] = [
  {
    id: 'log-1',
    studentId: 'student-faith',
    entryDate: '2026-07-10',
    tasksPerformed: 'Assisted in configuration and setup of local network switches. Set up subnetting masks for 50 workstations in the lab.',
    skillsAcquired: 'Subnetting, Router configuration, LAN installation.',
    aiStatus: 'COMPLIANT',
    aiSummary: 'High-quality technical entry details network addressing and device configuration.',
    aiDetails: {
      qualityRating: 'Good',
      technicalSkills: ['Computer Network Configuration', 'Router & Switch Configuration'],
      flags: [],
      suggestedComment: 'Excellent practical application of networking principles. Keep building on this experience.'
    },
    supervisorStatus: 'APPROVED',
    supervisorFeedback: 'Well documented work on network configuration. Make sure you understand the difference between public and private IP ranges in practice.',
    submittedAt: '2026-07-10T16:30:00Z'
  },
  {
    id: 'log-2',
    studentId: 'student-faith',
    entryDate: '2026-07-13',
    tasksPerformed: 'Helped check some computer cables in the room. Some were broken and we crimped new RJ45 connectors.',
    skillsAcquired: 'Cable crimping.',
    aiStatus: 'WARNING',
    aiSummary: 'Short entry description with limited technical explanation of networking tasks.',
    aiDetails: {
      qualityRating: 'Medium',
      technicalSkills: ['LAN Cable Crimping & Testing', 'Hardware Troubleshooting'],
      flags: ['Warning: Describe the tools and cable standards (e.g., Cat5e, Cat6, T568B) used for crimping.'],
      suggestedComment: 'Please specify the category of cables and the standard wiring color codes used.'
    },
    supervisorStatus: 'PENDING',
    submittedAt: '2026-07-13T17:15:00Z'
  },
  {
    id: 'log-3',
    studentId: 'student-faith',
    entryDate: '2026-07-14',
    tasksPerformed: 'Cleaned the server room and watched senior engineers set up the server. Did nothing else.',
    skillsAcquired: 'Observation.',
    aiStatus: 'CRITICAL',
    aiSummary: 'Extremely poor report detail; flags passive activity and lacks active engagement or learning.',
    aiDetails: {
      qualityRating: 'Poor',
      technicalSkills: ['General IT Support'],
      flags: [
        'Critical: The log reports passive observation without active hands-on tasks.',
        'Low Detail: Provide description of the server configurations (OS, hardware specs, roles setup).'
      ],
      suggestedComment: 'SIWES requires active learning. Please request hands-on tasks from your industry guide, and describe what server features you configured or tested.'
    },
    supervisorStatus: 'PENDING',
    submittedAt: '2026-07-14T11:00:00Z'
  }
];

const initialSessions: SupervisionSession[] = [
  {
    id: 'session-1',
    studentId: 'student-faith',
    supervisorId: 'supervisor-charity',
    scheduledTime: '2026-07-15T10:00',
    roomId: 'ROOM-CS-2022-224',
    sessionStatus: 'SCHEDULED',
    notes: 'Mid-term evaluation and placement verification call.'
  }
];

const SIWESContext = createContext<SIWESContextType | undefined>(undefined);

export const SIWESProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('STUDENT');
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>(initialLogs);
  const [supervisionSessions, setSupervisionSessions] = useState<SupervisionSession[]>(initialSessions);

  const toggleUserRole = () => {
    setUserRole(prev => (prev === 'STUDENT' ? 'SUPERVISOR' : 'STUDENT'));
  };

  const addLogbookEntry = (tasksPerformed: string, skillsAcquired: string, date: string, imageUrl?: string): LogbookEntry => {
    const aiResult = analyzeLogbookWithGemma(tasksPerformed, skillsAcquired);
    
    let aiStatus: AIStatus = 'COMPLIANT';
    if (aiResult.qualityRating === 'Poor') aiStatus = 'CRITICAL';
    else if (aiResult.qualityRating === 'Medium') aiStatus = 'WARNING';

    const newEntry: LogbookEntry = {
      id: `log-${Date.now()}`,
      studentId: 'student-faith',
      entryDate: date,
      tasksPerformed,
      skillsAcquired,
      imageUrl,
      aiStatus,
      aiSummary: aiResult.flags.length > 0 
        ? aiResult.flags[0] 
        : 'Detailed report with clear technical content.',
      aiDetails: aiResult,
      supervisorStatus: 'PENDING',
      submittedAt: new Date().toISOString()
    };

    setLogbookEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateLogbookStatus = (entryId: string, status: SupervisorStatus, feedback: string) => {
    setLogbookEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, supervisorStatus: status, supervisorFeedback: feedback }
          : entry
      )
    );
  };

  const scheduleSession = (dateTime: string) => {
    const newSession: SupervisionSession = {
      id: `session-${Date.now()}`,
      studentId: 'student-faith',
      supervisorId: 'supervisor-charity',
      scheduledTime: dateTime,
      roomId: `ROOM-CS-${Math.floor(1000 + Math.random() * 9000)}`,
      sessionStatus: 'SCHEDULED',
      notes: 'Scheduled evaluation session'
    };
    setSupervisionSessions(prev => [newSession, ...prev]);
  };

  return (
    <SIWESContext.Provider
      value={{
        userRole,
        studentProfile: initialStudent,
        supervisorProfile: initialSupervisor,
        logbookEntries,
        supervisionSessions,
        toggleUserRole,
        addLogbookEntry,
        updateLogbookStatus,
        scheduleSession
      }}
    >
      {children}
    </SIWESContext.Provider>
  );
};

export const useSIWES = () => {
  const context = useContext(SIWESContext);
  if (!context) {
    throw new Error('useSIWES must be used within a SIWESProvider');
  }
  return context;
};

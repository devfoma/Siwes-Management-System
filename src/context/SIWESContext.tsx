import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from './AuthContext';
import type { AIStatus, LogbookEntry, SupervisionSession, SupervisorStatus, UserRole } from '../interfaces/types';
import {
  createLogbookEntry,
  createSupervisionSession,
  AdminSupervisor,
  assignSupervisorToStudentRecord,
  createSupervisorAccountRequest,
  DynamicStudentProfile,
  DynamicSupervisorProfile,
  ensureCurrentUserProfile,
  loadAllStudents,
  loadAllSupervisors,
  loadAssignedStudents,
  loadLogbookEntries,
  loadStudentProfile,
  loadSupervisorProfile,
  loadSupervisionSessions,
  saveLogbookReview,
  subscribeToWorkspaceChanges,
} from '../services/siwesRepository';
import type { AIAnalysisResult } from '../services/aiService';
import { supabase } from '../utils/supabase';

export type { AdminSupervisor, DynamicStudentProfile, DynamicSupervisorProfile } from '../services/siwesRepository';

interface SIWESContextType {
  loadingData: boolean;
  dataError: string;
  currentUserId: string | null;
  currentUserName: string;
  userRole: UserRole;
  studentProfile: DynamicStudentProfile | null;
  supervisorProfile: DynamicSupervisorProfile | null;
  assignedStudents: DynamicStudentProfile[];
  studentsList: DynamicStudentProfile[];
  supervisorsList: AdminSupervisor[];
  activeStudentProfile: DynamicStudentProfile | null;
  selectedStudentId: string | null;
  logbookEntries: LogbookEntry[];
  supervisionSessions: SupervisionSession[];
  setSelectedStudentId: (studentId: string | null) => void;
  refreshData: () => Promise<void>;
  addLogbookEntry: (
    tasksPerformed: string,
    skillsAcquired: string,
    date: string,
    imageUrl?: string,
    aiResult?: AIAnalysisResult
  ) => Promise<LogbookEntry>;
  updateLogbookStatus: (entryId: string, status: SupervisorStatus, feedback: string) => Promise<void>;
  scheduleSession: (dateTime: string, studentId?: string, notes?: string) => Promise<SupervisionSession>;
  addSupervisor: (
    fullName: string,
    staffId: string,
    department: string,
    designation: string,
    supervisorType: 'ACADEMIC' | 'INDUSTRY'
  ) => Promise<void>;
  assignSupervisorToStudent: (studentId: string, supervisorId: string) => Promise<void>;
}

const SIWESContext = createContext<SIWESContextType | undefined>(undefined);

export const SIWESProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('STUDENT');
  const [studentProfile, setStudentProfile] = useState<DynamicStudentProfile | null>(null);
  const [supervisorProfile, setSupervisorProfile] = useState<DynamicSupervisorProfile | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<DynamicStudentProfile[]>([]);
  const [studentsList, setStudentsList] = useState<DynamicStudentProfile[]>([]);
  const [supervisorsList, setSupervisorsList] = useState<AdminSupervisor[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [supervisionSessions, setSupervisionSessions] = useState<SupervisionSession[]>([]);

  const refreshData = useCallback(async () => {
    if (!user) {
      setStudentProfile(null);
      setSupervisorProfile(null);
      setAssignedStudents([]);
      setStudentsList([]);
      setSupervisorsList([]);
      setSelectedStudentId(null);
      setLogbookEntries([]);
      setSupervisionSessions([]);
      return;
    }

    setLoadingData(true);
    setDataError('');

    try {
      const profile = await ensureCurrentUserProfile(user);
      setUserRole(profile.role);

      let student: DynamicStudentProfile | null = null;
      let supervisor: DynamicSupervisorProfile | null = null;
      let students: DynamicStudentProfile[] = [];
      let allStudents: DynamicStudentProfile[] = [];
      let allSupervisors: AdminSupervisor[] = [];

      if (profile.role === 'STUDENT') {
        student = await loadStudentProfile(user.id);
      } else if (profile.role === 'SUPERVISOR') {
        supervisor = await loadSupervisorProfile(user.id);
        students = await loadAssignedStudents(user.id);
      } else if (profile.role === 'ADMIN') {
        allStudents = await loadAllStudents();
        allSupervisors = await loadAllSupervisors();
      }

      const effectiveSelectedStudentId =
        profile.role === 'STUDENT'
          ? user.id
          : selectedStudentId && students.some((item) => item.id === selectedStudentId)
          ? selectedStudentId
          : students[0]?.id || null;

      const logs = await loadLogbookEntries(
        profile.role,
        user.id,
        profile.role === 'SUPERVISOR' ? students.map((item) => item.id) : []
      );
      const sessions = await loadSupervisionSessions(
        profile.role,
        user.id,
        profile.role === 'SUPERVISOR' ? students.map((item) => item.id) : []
      );

      setStudentProfile(student);
      setSupervisorProfile(supervisor);
      setAssignedStudents(students);
      setStudentsList(profile.role === 'ADMIN' ? allStudents : students);
      setSupervisorsList(profile.role === 'ADMIN' ? allSupervisors : []);
      setSelectedStudentId(effectiveSelectedStudentId);
      setLogbookEntries(logs);
      setSupervisionSessions(sessions);
    } catch (error: any) {
      setDataError(error.message || 'Unable to load SIWES data.');
    } finally {
      setLoadingData(false);
    }
  }, [selectedStudentId, user]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    refreshData();

    if (user) {
      channel = subscribeToWorkspaceChanges(() => {
        refreshData();
      });
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshData, user]);

  const activeStudentProfile = useMemo(() => {
    if (userRole === 'STUDENT') return studentProfile;
    return assignedStudents.find((student) => student.id === selectedStudentId) || null;
  }, [assignedStudents, selectedStudentId, studentProfile, userRole]);

  const currentUserName =
    userRole === 'STUDENT'
      ? studentProfile?.fullName || user?.email || 'Student'
      : supervisorProfile?.fullName || user?.email || 'Supervisor';

  const addLogbookEntry = async (
    tasksPerformed: string,
    skillsAcquired: string,
    date: string,
    imageUrl?: string,
    aiResult?: AIAnalysisResult
  ): Promise<LogbookEntry> => {
    if (!user || userRole !== 'STUDENT') {
      throw new Error('Only authenticated students can submit logbook entries.');
    }

    const entry = await createLogbookEntry({
      studentId: user.id,
      entryDate: date,
      tasksPerformed,
      skillsAcquired,
      imageUrl,
      aiStatus: aiResult?.status || ('PENDING' as AIStatus),
      aiSummary: aiResult?.summary,
      aiDetails: aiResult
        ? {
            qualityRating: aiResult.qualityRating,
            technicalSkills: aiResult.technicalSkills,
            flags: aiResult.flags,
            suggestedComment: aiResult.suggestedComment,
          }
        : undefined,
    });

    await refreshData();
    return entry;
  };

  const updateLogbookStatus = async (
    entryId: string,
    status: SupervisorStatus,
    feedback: string
  ): Promise<void> => {
    await saveLogbookReview(entryId, status, feedback);
    await refreshData();
  };

  const scheduleSession = async (
    dateTime: string,
    studentId?: string,
    notes?: string
  ): Promise<SupervisionSession> => {
    const targetStudentId = studentId || activeStudentProfile?.id;
    const supervisorId =
      userRole === 'SUPERVISOR'
        ? user?.id
        : activeStudentProfile?.supervisorId || supervisionSessions[0]?.supervisorId;

    if (!targetStudentId || !supervisorId) {
      throw new Error('A student and supervisor are required before scheduling a supervision session.');
    }

    const session = await createSupervisionSession({
      studentId: targetStudentId,
      supervisorId,
      scheduledTime: dateTime,
      notes,
    });

    await refreshData();
    return session;
  };

  const addSupervisor = async (
    fullName: string,
    staffId: string,
    department: string,
    designation: string,
    supervisorType: 'ACADEMIC' | 'INDUSTRY'
  ): Promise<void> => {
    await createSupervisorAccountRequest({
      fullName,
      staffId,
      department,
      designation,
      supervisorType,
    });
    await refreshData();
  };

  const assignSupervisorToStudent = async (studentId: string, supervisorId: string): Promise<void> => {
    await assignSupervisorToStudentRecord(studentId, supervisorId);
    await refreshData();
  };

  return (
    <SIWESContext.Provider
      value={{
        loadingData,
        dataError,
        currentUserId: user?.id || null,
        currentUserName,
        userRole,
        studentProfile,
        supervisorProfile,
        assignedStudents,
        studentsList,
        supervisorsList,
        activeStudentProfile,
        selectedStudentId,
        logbookEntries,
        supervisionSessions,
        setSelectedStudentId,
        refreshData,
        addLogbookEntry,
        updateLogbookStatus,
        scheduleSession,
        addSupervisor,
        assignSupervisorToStudent,
      }}
    >
      {children}
    </SIWESContext.Provider>
  );
};

export const useSIWES = () => {
  const context = useContext(SIWESContext);
  if (!context) {
    throw new Error('useSIWES must be used within an SIWESProvider');
  }
  return context;
};

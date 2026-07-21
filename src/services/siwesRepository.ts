import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import type {
  AIStatus,
  LogbookEntry,
  SessionStatus,
  StudentProfile,
  SupervisorProfile,
  SupervisorStatus,
  UserRole,
  SupervisionSession,
} from '../interfaces/types';

export interface DynamicStudentProfile extends StudentProfile {
  fullName: string;
}

export interface DynamicSupervisorProfile extends SupervisorProfile {
  fullName: string;
}

export interface AdminSupervisor extends DynamicSupervisorProfile {
  supervisorType: 'ACADEMIC' | 'INDUSTRY';
}

type ProfileRow = {
  id: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
};

type StudentProfileRow = {
  user_id: string;
  matric_no: string | null;
  department: string | null;
  faculty?: string | null;
  organization_name: string | null;
  organization_address: string | null;
  latitude: number | null;
  longitude: number | null;
  supervisor_id: string | null;
};

type SupervisorProfileRow = {
  user_id: string;
  staff_id: string | null;
  faculty?: string | null;
  department: string | null;
  designation: string | null;
  supervisor_type?: 'ACADEMIC' | 'INDUSTRY' | null;
};

type LogbookEntryRow = {
  id: string;
  student_id: string;
  entry_date: string;
  tasks_performed: string;
  skills_acquired: string;
  image_url: string | null;
  ai_status: AIStatus;
  ai_summary: string | null;
  ai_details: LogbookEntry['aiDetails'] | null;
  supervisor_status: SupervisorStatus;
  supervisor_feedback: string | null;
  submitted_at: string;
};

type SupervisionSessionRow = {
  id: string;
  student_id: string;
  supervisor_id: string;
  scheduled_time: string;
  room_id: string;
  session_status: SessionStatus;
  notes: string | null;
};

export async function ensureCurrentUserProfile(user: SupabaseUser): Promise<ProfileRow> {
  const metadata = user.user_metadata || {};
  const role = (metadata.role || 'STUDENT') as UserRole;
  const fullName = metadata.full_name || user.email || 'SIWES User';

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        role,
      },
      { onConflict: 'id' }
    )
    .select('id,full_name,role,created_at')
    .single();

  if (profileError) throw profileError;

  const roleData = metadata.role_data || {};
  if (role === 'STUDENT') {
    const { error } = await supabase.from('student_profiles').upsert(
      {
        user_id: user.id,
        matric_no: roleData.matricNo || null,
        department: roleData.department || null,
        faculty: roleData.faculty || null,
        organization_name: roleData.organizationName || null,
        organization_address: roleData.organizationAddress || null,
        latitude: roleData.latitude || null,
        longitude: roleData.longitude || null,
        supervisor_id: roleData.supervisorId || null,
      },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
  }

  return profile as ProfileRow;
}

export async function loadStudentProfile(userId: string): Promise<DynamicStudentProfile | null> {
  const [{ data: profile, error: profileError }, { data: student, error: studentError }] =
    await Promise.all([
      supabase.from('profiles').select('id,full_name,role,created_at').eq('id', userId).single(),
      supabase.from('student_profiles').select('*').eq('user_id', userId).maybeSingle(),
    ]);

  if (profileError) throw profileError;
  if (studentError) throw studentError;
  if (!student) return null;

  return mapStudentProfile(student as StudentProfileRow, profile as ProfileRow);
}

export async function loadSupervisorProfile(userId: string): Promise<DynamicSupervisorProfile | null> {
  const [{ data: profile, error: profileError }, { data: supervisor, error: supervisorError }] =
    await Promise.all([
      supabase.from('profiles').select('id,full_name,role,created_at').eq('id', userId).single(),
      supabase.from('supervisor_profiles').select('*').eq('user_id', userId).maybeSingle(),
    ]);

  if (profileError) throw profileError;
  if (supervisorError) throw supervisorError;
  if (!supervisor) return null;

  const supervisorRow = supervisor as SupervisorProfileRow;
  return {
    id: supervisorRow.user_id,
    userId: supervisorRow.user_id,
    fullName: (profile as ProfileRow).full_name,
    staffId: supervisorRow.staff_id || '',
    faculty: supervisorRow.faculty || undefined,
    department: supervisorRow.department || '',
    designation: supervisorRow.designation || '',
  };
}

export async function loadAssignedStudents(supervisorId: string): Promise<DynamicStudentProfile[]> {
  const { data: studentRows, error: studentsError } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('supervisor_id', supervisorId)
    .order('department', { ascending: true });

  if (studentsError) throw studentsError;
  if (!studentRows || studentRows.length === 0) return [];

  const userIds = studentRows.map((row) => (row as StudentProfileRow).user_id);
  const { data: profileRows, error: profilesError } = await supabase
    .from('profiles')
    .select('id,full_name,role,created_at')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profilesById = new Map((profileRows || []).map((row) => [(row as ProfileRow).id, row as ProfileRow]));
  return studentRows.map((row) =>
    mapStudentProfile(
      row as StudentProfileRow,
      profilesById.get((row as StudentProfileRow).user_id) || {
        id: (row as StudentProfileRow).user_id,
        full_name: 'Unlisted Student',
        role: 'STUDENT',
      }
    )
  );
}

export async function loadAllStudents(): Promise<DynamicStudentProfile[]> {
  const { data: studentRows, error: studentsError } = await supabase
    .from('student_profiles')
    .select('*')
    .order('department', { ascending: true });

  if (studentsError) throw studentsError;
  if (!studentRows || studentRows.length === 0) return [];

  return hydrateStudentProfiles(studentRows as StudentProfileRow[]);
}

export async function loadAllSupervisors(): Promise<AdminSupervisor[]> {
  const { data: supervisorRows, error: supervisorsError } = await supabase
    .from('supervisor_profiles')
    .select('*')
    .order('faculty', { ascending: true })
    .order('department', { ascending: true });

  if (supervisorsError) throw supervisorsError;
  if (!supervisorRows || supervisorRows.length === 0) return [];

  const userIds = supervisorRows.map((row) => (row as SupervisorProfileRow).user_id);
  const { data: profileRows, error: profilesError } = await supabase
    .from('profiles')
    .select('id,full_name,role,created_at')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profilesById = new Map((profileRows || []).map((row) => [(row as ProfileRow).id, row as ProfileRow]));
  return supervisorRows.map((row) => {
    const supervisor = row as SupervisorProfileRow;
    const profile = profilesById.get(supervisor.user_id);
    return {
      id: supervisor.user_id,
      userId: supervisor.user_id,
      fullName: profile?.full_name || 'Unlisted Supervisor',
      staffId: supervisor.staff_id || '',
      faculty: supervisor.faculty || undefined,
      department: supervisor.department || '',
      designation: supervisor.designation || '',
      supervisorType: supervisor.supervisor_type || 'ACADEMIC',
    };
  });
}

export async function assignSupervisorToStudentRecord(studentId: string, supervisorId: string): Promise<void> {
  const { error } = await supabase
    .from('student_profiles')
    .update({ supervisor_id: supervisorId })
    .eq('user_id', studentId);

  if (error) throw error;
}

export async function createSupervisorAccountRequest(params: {
  fullName: string;
  email: string;
  password: string;
  staffId: string;
  faculty: string;
  department: string;
  designation: string;
  supervisorType: 'ACADEMIC' | 'INDUSTRY';
}): Promise<void> {
  const adminApiUrl = process.env.EXPO_PUBLIC_ADMIN_API_URL;
  if (!adminApiUrl) {
    throw new Error('Admin API is not configured. Set EXPO_PUBLIC_ADMIN_API_URL to provision supervisor auth accounts.');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const response = await fetch(`${adminApiUrl.replace(/\/$/, '')}/supervisors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionData.session?.access_token || ''}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let message = `Supervisor provisioning failed with status ${response.status}.`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === 'string') {
        message = errorBody.error;
      }
    } catch {
      // Keep the status-based message when the API does not return JSON.
    }
    throw new Error(message);
  }
}

export async function loadLogbookEntries(
  userRole: UserRole,
  userId: string,
  assignedStudentIds: string[]
): Promise<LogbookEntry[]> {
  let query = supabase.from('logbook_entries').select('*').order('submitted_at', { ascending: false });

  if (userRole === 'STUDENT') {
    query = query.eq('student_id', userId);
  } else if (userRole === 'SUPERVISOR') {
    if (assignedStudentIds.length === 0) return [];
    query = query.in('student_id', assignedStudentIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row) => mapLogbookEntry(row as LogbookEntryRow));
}

export async function loadSupervisionSessions(
  userRole: UserRole,
  userId: string,
  assignedStudentIds: string[]
): Promise<SupervisionSession[]> {
  let query = supabase.from('supervision_sessions').select('*').order('scheduled_time', { ascending: true });

  if (userRole === 'STUDENT') {
    query = query.eq('student_id', userId);
  } else if (userRole === 'SUPERVISOR') {
    query = query.eq('supervisor_id', userId);
  } else if (assignedStudentIds.length > 0) {
    query = query.in('student_id', assignedStudentIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row) => mapSupervisionSession(row as SupervisionSessionRow));
}

export async function createLogbookEntry(params: {
  studentId: string;
  entryDate: string;
  tasksPerformed: string;
  skillsAcquired: string;
  imageUrl?: string;
  aiStatus: AIStatus;
  aiSummary?: string;
  aiDetails?: LogbookEntry['aiDetails'];
}): Promise<LogbookEntry> {
  const { data, error } = await supabase
    .from('logbook_entries')
    .insert({
      student_id: params.studentId,
      entry_date: params.entryDate,
      tasks_performed: params.tasksPerformed,
      skills_acquired: params.skillsAcquired,
      image_url: params.imageUrl || null,
      ai_status: params.aiStatus,
      ai_summary: params.aiSummary || null,
      ai_details: params.aiDetails || null,
      supervisor_status: 'PENDING',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapLogbookEntry(data as LogbookEntryRow);
}

export async function saveLogbookReview(
  entryId: string,
  status: SupervisorStatus,
  feedback: string
): Promise<void> {
  const { error } = await supabase
    .from('logbook_entries')
    .update({
      supervisor_status: status,
      supervisor_feedback: feedback,
    })
    .eq('id', entryId);

  if (error) throw error;
}

export async function createSupervisionSession(params: {
  studentId: string;
  supervisorId: string;
  scheduledTime: string;
  notes?: string;
}): Promise<SupervisionSession> {
  const roomId = `ROOM-${Date.now().toString(36).toUpperCase()}`;
  const { data, error } = await supabase
    .from('supervision_sessions')
    .insert({
      student_id: params.studentId,
      supervisor_id: params.supervisorId,
      scheduled_time: params.scheduledTime,
      room_id: roomId,
      session_status: 'SCHEDULED',
      notes: params.notes || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapSupervisionSession(data as SupervisionSessionRow);
}

const SIWES_REALTIME_TABLES = [
  'profiles',
  'student_profiles',
  'supervisor_profiles',
  'logbook_entries',
  'supervision_sessions',
  'call_messages',
] as const;

export function subscribeToWorkspaceChanges(onChange: () => void) {
  return SIWES_REALTIME_TABLES.reduce(
    (channel, table) =>
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, onChange),
    supabase.channel('siwes-workspace')
  ).subscribe();
}

async function hydrateStudentProfiles(studentRows: StudentProfileRow[]): Promise<DynamicStudentProfile[]> {
  const userIds = studentRows.map((row) => row.user_id);
  const { data: profileRows, error: profilesError } = await supabase
    .from('profiles')
    .select('id,full_name,role,created_at')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profilesById = new Map((profileRows || []).map((row) => [(row as ProfileRow).id, row as ProfileRow]));
  return studentRows.map((row) =>
    mapStudentProfile(
      row,
      profilesById.get(row.user_id) || {
        id: row.user_id,
        full_name: 'Unlisted Student',
        role: 'STUDENT',
      }
    )
  );
}

function mapStudentProfile(row: StudentProfileRow, profile: ProfileRow): DynamicStudentProfile {
  return {
    id: row.user_id,
    userId: row.user_id,
    fullName: profile.full_name,
    matricNo: row.matric_no || '',
    department: row.department || '',
    faculty: row.faculty || undefined,
    organizationName: row.organization_name || '',
    organizationAddress: row.organization_address || '',
    latitude: row.latitude,
    longitude: row.longitude,
    supervisorId: row.supervisor_id,
  };
}

function mapLogbookEntry(row: LogbookEntryRow): LogbookEntry {
  return {
    id: row.id,
    studentId: row.student_id,
    entryDate: row.entry_date,
    tasksPerformed: row.tasks_performed,
    skillsAcquired: row.skills_acquired,
    imageUrl: row.image_url || undefined,
    aiStatus: row.ai_status,
    aiSummary: row.ai_summary || undefined,
    aiDetails: row.ai_details || undefined,
    supervisorStatus: row.supervisor_status,
    supervisorFeedback: row.supervisor_feedback || undefined,
    submittedAt: row.submitted_at,
  };
}

function mapSupervisionSession(row: SupervisionSessionRow): SupervisionSession {
  return {
    id: row.id,
    studentId: row.student_id,
    supervisorId: row.supervisor_id,
    scheduledTime: row.scheduled_time,
    roomId: row.room_id,
    sessionStatus: row.session_status,
    notes: row.notes || undefined,
  };
}

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator } from 'react-native';
import { SIWESProvider, useSIWES } from './src/context/SIWESContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/common/Header';
import { AuthScreen } from './src/components/auth/AuthScreen';
import { StudentDashboard } from './src/components/student/StudentDashboard';
import { LogbookForm } from './src/components/student/LogbookForm';
import { VideoCallRoom } from './src/components/student/VideoCallRoom';
import { SupervisorDashboard } from './src/components/supervisor/SupervisorDashboard';
import { StudentDetailPortal } from './src/components/supervisor/StudentDetailPortal';

type Page = 'DASHBOARD' | 'ADD_LOG' | 'VIDEO' | 'STUDENT_DETAIL';

const AppContent: React.FC = () => {
  const { user, session, loading } = useAuth();
  const { userRole } = useSIWES();
  const [page, setPage] = useState<Page>('DASHBOARD');

  // Reset navigation page when user toggles roles
  useEffect(() => {
    setPage('DASHBOARD');
  }, [userRole]);

  // Loading spinner during auth session extraction
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#77da9f" />
      </View>
    );
  }

  // Redirect to skeuomorphic Auth Screen if unauthenticated
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1511" />
      
      {/* Top Header Navigation */}
      <Header />

      {/* Main Screen Router Body */}
      <View style={styles.main}>
        {userRole === 'STUDENT' ? (
          <>
            {page === 'DASHBOARD' && (
              <StudentDashboard 
                onAddLog={() => setPage('ADD_LOG')} 
                onJoinCall={() => setPage('VIDEO')} 
              />
            )}
            {page === 'ADD_LOG' && (
              <LogbookForm onBack={() => setPage('DASHBOARD')} />
            )}
            {page === 'VIDEO' && (
              <VideoCallRoom onLeave={() => setPage('DASHBOARD')} />
            )}
          </>
        ) : (
          <>
            {page === 'DASHBOARD' && (
              <SupervisorDashboard
                onSelectStudent={() => setPage('STUDENT_DETAIL')}
                onJoinCall={() => setPage('VIDEO')}
              />
            )}
            {page === 'STUDENT_DETAIL' && (
              <StudentDetailPortal onBack={() => setPage('DASHBOARD')} />
            )}
            {page === 'VIDEO' && (
              <VideoCallRoom onLeave={() => setPage('DASHBOARD')} />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SIWESProvider>
        <AppContent />
      </SIWESProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1511',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f1511',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
  },
});

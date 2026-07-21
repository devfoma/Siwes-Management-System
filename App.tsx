import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator, SafeAreaView, Platform, Text, TouchableOpacity } from 'react-native';
import { SIWESProvider, useSIWES } from './src/context/SIWESContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/common/Header';
import { AuthScreen } from './src/components/auth/AuthScreen';
import { StudentTabNavigation } from './src/components/student/StudentTabNavigation';
import { LogbookForm } from './src/components/student/LogbookForm';
import { SupervisorTabNavigation } from './src/components/supervisor/SupervisorTabNavigation';
import { AdminTabNavigation } from './src/components/admin/AdminTabNavigation';

type Page = 'DASHBOARD' | 'ADD_LOG' | 'VIDEO' | 'STUDENT_DETAIL';

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();
  const { dataError, loadingData, refreshData, userRole } = useSIWES();
  const [page, setPage] = useState<Page>('DASHBOARD');

  // Reset navigation page when user toggles roles
  useEffect(() => {
    setPage('DASHBOARD');
  }, [userRole]);

  // Loading spinner during auth session extraction
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#77da9f" />
      </SafeAreaView>
    );
  }

  // Redirect to skeuomorphic Auth Screen if unauthenticated
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthScreen />
      </SafeAreaView>
    );
  }

  if (loadingData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#77da9f" />
        <Text style={styles.loadingText}>Loading SIWES workspace...</Text>
      </SafeAreaView>
    );
  }

  if (dataError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Workspace setup needs attention</Text>
        <Text style={styles.errorText}>{dataError}</Text>
        <TouchableOpacity onPress={refreshData} style={styles.retryBtn} activeOpacity={0.85}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1511" />
      
      {/* Top Header Navigation */}
      <Header />

      {/* Main Screen Router Body */}
      <View style={styles.main}>
        {userRole === 'STUDENT' ? (
          <>
            {page === 'ADD_LOG' ? (
              <LogbookForm onBack={() => setPage('DASHBOARD')} />
            ) : (
              <StudentTabNavigation
                onAddLogTrigger={() => setPage('ADD_LOG')}
                onJoinCallTrigger={() => setPage('VIDEO')}
              />
            )}
          </>
        ) : userRole === 'SUPERVISOR' ? (
          <SupervisorTabNavigation />
        ) : (
          <AdminTabNavigation />
        )}
      </View>
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'ios' ? 60 : (Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50) : 10),
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f1511',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : (Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50) : 10),
  },
  main: {
    flex: 1,
  },
  loadingText: {
    color: '#c0c9c0',
    fontSize: 12,
    marginTop: 12,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#198754',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 18,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

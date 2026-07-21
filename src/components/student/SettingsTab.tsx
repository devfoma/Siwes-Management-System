import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';
import { useAuth } from '../../context/AuthContext';

export const SettingsTab: React.FC = () => {
  const { studentProfile, supervisorProfile, userRole, currentUserName } = useSIWES();
  const { signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>User & Device Settings</Text>

      {userRole === 'STUDENT' && (
        <>
          {/* Profile summary card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Identity Information</Text>
            <View style={styles.profileRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {studentProfile?.fullName ? studentProfile.fullName.substring(0, 2).toUpperCase() : 'ST'}
                </Text>
              </View>
              <View>
                <Text style={styles.profileName}>{studentProfile?.fullName || currentUserName}</Text>
                <Text style={styles.matricText}>Matric: {studentProfile?.matricNo || 'Not provided'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Academic Dept:</Text>
              <Text style={styles.metaValue}>{studentProfile?.department || 'Not provided'}</Text>
            </View>
          </View>

          {/* Placement information */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SIWES Placement Information</Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Firm Name:</Text>
              <Text style={styles.metaValue}>{studentProfile?.organizationName || 'Not provided'}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Address:</Text>
              <Text style={styles.metaValue}>{studentProfile?.organizationAddress || 'Not provided'}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Office Coordinates:</Text>
              <Text style={styles.coords}>
                Lat: {studentProfile?.latitude ?? 'N/A'}, Lon: {studentProfile?.longitude ?? 'N/A'}
              </Text>
            </View>
          </View>
        </>
      )}

      {userRole === 'SUPERVISOR' && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Supervisor Profile</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {supervisorProfile?.fullName ? supervisorProfile.fullName.substring(0, 2).toUpperCase() : 'SP'}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{supervisorProfile?.fullName || currentUserName}</Text>
              <Text style={styles.matricText}>Staff ID: {supervisorProfile?.staffId || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Faculty:</Text>
            <Text style={styles.metaValue}>{supervisorProfile?.faculty || 'Not provided'}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Department:</Text>
            <Text style={styles.metaValue}>{supervisorProfile?.department || 'Not provided'}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Designation:</Text>
            <Text style={styles.metaValue}>{supervisorProfile?.designation || 'Not provided'}</Text>
          </View>
        </View>
      )}

      {userRole === 'ADMIN' && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Administrator Profile</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{currentUserName}</Text>
              <Text style={styles.matricText}>Role: Administrator</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Office / Directorate:</Text>
            <Text style={styles.metaValue}>Not provided</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Access Scope:</Text>
            <Text style={styles.metaValue}>Administrative portal</Text>
          </View>
        </View>
      )}

      {/* Log Out Actions */}
      <TouchableOpacity onPress={signOut} style={styles.logoutBtn} activeOpacity={0.8}>
        <MaterialIcons name="logout" size={16} color="#ffffff" />
        <Text style={styles.logoutText}>Terminate Auth Session</Text>
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    paddingBottom: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a100c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0f5132',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#95d4ac',
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  matricText: {
    fontSize: 12,
    color: '#c0c9c0',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: '#c0c9c0',
    fontWeight: 'bold',
  },
  metaValue: {
    fontSize: 11,
    color: '#ffffff',
    flex: 1,
    textAlign: 'right',
  },
  coords: {
    fontSize: 10,
    color: '#77da9f',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    height: 44,
    borderBottomWidth: 3,
    borderBottomColor: '#69101a',
    marginTop: 12,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

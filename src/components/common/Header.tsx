import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';

export const Header: React.FC = () => {
  const { userRole, toggleUserRole, studentProfile, supervisorProfile } = useSIWES();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Brand logo & portal indicator */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <MaterialIcons
              name={userRole === 'STUDENT' ? 'school' : 'supervisor-account'}
              size={20}
              color="#95d4ac"
            />
          </View>
          <View>
            <Text style={styles.brandTitle}>SIWES Connect</Text>
            <Text style={styles.portalSub}>
              {userRole === 'STUDENT' ? 'Student Portal' : 'Supervisor Portal'}
            </Text>
          </View>
        </View>

        {/* Portal switcher controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={toggleUserRole}
            style={styles.switcherButton}
            activeOpacity={0.85}
          >
            <MaterialIcons name="swap-horiz" size={14} color="#261a00" />
            <Text style={styles.switcherText}>
              To {userRole === 'STUDENT' ? 'Supervisor' : 'Student'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0f5132',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dee4dd',
    letterSpacing: 0.2,
  },
  portalSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#95d4ac',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffc107',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#8a6804',
  },
  switcherText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#261a00',
    textTransform: 'uppercase',
  },
});

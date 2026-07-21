import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES } from '../../context/SIWESContext';

export const Header: React.FC = () => {
  const { userRole, currentUserName } = useSIWES();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Brand logo & portal indicator */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <MaterialIcons
              name={
                userRole === 'STUDENT'
                  ? 'school'
                  : userRole === 'SUPERVISOR'
                  ? 'supervisor-account'
                  : 'admin-panel-settings'
              }
              size={20}
              color="#95d4ac"
            />
          </View>
          <View>
            <Text style={styles.brandTitle}>SIWES Connect</Text>
            <Text style={styles.portalSub}>
              {userRole === 'STUDENT'
                ? 'Student Portal'
                : userRole === 'SUPERVISOR'
                ? 'Supervisor Portal'
                : 'Admin Portal'}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Text numberOfLines={1} style={styles.userName}>{currentUserName}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0f5132',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 8,
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
    maxWidth: 130,
  },
  userName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
});

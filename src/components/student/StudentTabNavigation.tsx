import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StudentDashboard } from './StudentDashboard';
import { DailyLogsTab } from './DailyLogsTab';
import { SettingsTab } from './SettingsTab';
import { VideoCallRoom } from './VideoCallRoom';

type Tab = 'DASHBOARD' | 'LOGS' | 'CALLS' | 'SETTINGS';

interface StudentTabNavigationProps {
  onAddLogTrigger: () => void;
  onJoinCallTrigger: () => void;
  activeScreenOverride?: 'ADD_LOG' | 'VIDEO' | null;
}

export const StudentTabNavigation: React.FC<StudentTabNavigationProps> = ({
  onAddLogTrigger,
  onJoinCallTrigger,
  activeScreenOverride,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');

  // Helper render method for active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <StudentDashboard
            onAddLog={onAddLogTrigger}
            onJoinCall={() => setActiveTab('CALLS')}
          />
        );
      case 'LOGS':
        return <DailyLogsTab onAddLog={onAddLogTrigger} />;
      case 'CALLS':
        return <VideoCallRoom onLeave={() => setActiveTab('DASHBOARD')} />;
      case 'SETTINGS':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Primary Tab Panel Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Tactile Forest Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('DASHBOARD')}
          style={[styles.tabButton, activeTab === 'DASHBOARD' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="dashboard"
            size={18}
            color={activeTab === 'DASHBOARD' ? '#ffffff' : '#77da9f'}
          />
          <Text style={[styles.tabText, activeTab === 'DASHBOARD' && styles.tabTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('LOGS')}
          style={[styles.tabButton, activeTab === 'LOGS' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="menu-book"
            size={18}
            color={activeTab === 'LOGS' ? '#ffffff' : '#77da9f'}
          />
          <Text style={[styles.tabText, activeTab === 'LOGS' && styles.tabTextActive]}>
            Logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('CALLS')}
          style={[styles.tabButton, activeTab === 'CALLS' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="videocam"
            size={18}
            color={activeTab === 'CALLS' ? '#ffffff' : '#77da9f'}
          />
          <Text style={[styles.tabText, activeTab === 'CALLS' && styles.tabTextActive]}>
            Calls
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('SETTINGS')}
          style={[styles.tabButton, activeTab === 'SETTINGS' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="settings"
            size={18}
            color={activeTab === 'SETTINGS' ? '#ffffff' : '#77da9f'}
          />
          <Text style={[styles.tabText, activeTab === 'SETTINGS' && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1511',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#1b211d',
    borderTopWidth: 1,
    borderTopColor: '#0f5132',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
    height: '100%',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(25, 135, 84, 0.08)',
  },
  tabText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#77da9f',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});

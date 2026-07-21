import React, { useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSIWES, type AdminSupervisor, type DynamicStudentProfile } from '../../context/SIWESContext';
import { SettingsTab } from '../student/SettingsTab';

type AdminTab = 'STUDENTS' | 'SUPERVISORS' | 'SETTINGS';

export const AdminTabNavigation: React.FC = () => {
  const { supervisorsList, studentsList, addSupervisor, assignSupervisorToStudent } = useSIWES();
  
  // Bottom Navigation Tabs
  const [activeTab, setActiveTab] = useState<AdminTab>('STUDENTS');
  const [collapsedFaculties, setCollapsedFaculties] = useState<Record<string, boolean>>({});
  
  // Modal states
  const [showAddSupervisorModal, setShowAddSupervisorModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<DynamicStudentProfile | null>(null);

  // Form states for new supervisor
  const [supName, setSupName] = useState<string>('');
  const [supEmail, setSupEmail] = useState<string>('');
  const [supPassword, setSupPassword] = useState<string>('');
  const [supStaffId, setSupStaffId] = useState<string>('');
  const [supFaculty, setSupFaculty] = useState<string>('');
  const [supDepartment, setSupDepartment] = useState<string>('');
  const [supDesignation, setSupDesignation] = useState<string>('');
  const [supType, setSupType] = useState<'ACADEMIC' | 'INDUSTRY'>('ACADEMIC');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [submittingSupervisor, setSubmittingSupervisor] = useState<boolean>(false);

  // Calculate Metrics
  const totalStudents = studentsList.length;
  const totalSupervisors = supervisorsList.length;
  const assignedStudents = studentsList.filter(s => Boolean(s.supervisorId)).length;
  const assignmentRate = totalStudents > 0 ? Math.round((assignedStudents / totalStudents) * 100) : 0;

  // Handle Register Supervisor Submit
  const handleRegisterSupervisor = async () => {
    if (!supName.trim() || !supEmail.trim() || !supPassword.trim() || !supStaffId.trim() || !supFaculty.trim() || !supDepartment.trim() || !supDesignation.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (supPassword.trim().length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setSubmittingSupervisor(true);

    try {
      const createdEmail = supEmail.trim();
      const createdPassword = supPassword.trim();
      await addSupervisor(supName, createdEmail, createdPassword, supStaffId, supFaculty, supDepartment, supDesignation, supType);
      setFormSuccess(`Supervisor credentials created in Faculty of ${supFaculty.trim()}. Email: ${createdEmail} | Password: ${createdPassword}`);

      // Reset Form
      setSupName('');
      setSupEmail('');
      setSupPassword('');
      setSupStaffId('');
      setSupFaculty('');
      setSupDepartment('');
      setSupDesignation('');
      setSupType('ACADEMIC');
    } catch (error: any) {
      setFormError(error.message || 'Unable to add supervisor.');
    } finally {
      setSubmittingSupervisor(false);
    }
  };

  const closeAddSupervisorModal = () => {
    setShowAddSupervisorModal(false);
    setFormError('');
    setFormSuccess('');
  };

  // Group Students by Faculty and then Department
  const getGroupedStudents = () => {
    const grouped: { [faculty: string]: { [department: string]: DynamicStudentProfile[] } } = {};
    
    studentsList.forEach(student => {
      const faculty = student.faculty || 'Uncategorized Faculty';
      const dept = student.department || 'Uncategorized Department';
      
      if (!grouped[faculty]) {
        grouped[faculty] = {};
      }
      if (!grouped[faculty][dept]) {
        grouped[faculty][dept] = [];
      }
      grouped[faculty][dept].push(student);
    });
    
    return grouped;
  };

  const groupedStudents = getGroupedStudents();

  const getGroupedSupervisors = () => {
    const grouped: { [faculty: string]: AdminSupervisor[] } = {};

    supervisorsList.forEach(supervisor => {
      const faculty = supervisor.faculty || 'Uncategorized Faculty';

      if (!grouped[faculty]) {
        grouped[faculty] = [];
      }
      grouped[faculty].push(supervisor);
    });

    return grouped;
  };

  const groupedSupervisors = getGroupedSupervisors();

  const isFacultyCollapsed = (scope: 'students' | 'supervisors', faculty: string) =>
    collapsedFaculties[`${scope}:${faculty}`] === true;

  const toggleFaculty = (scope: 'students' | 'supervisors', faculty: string) => {
    const key = `${scope}:${faculty}`;
    setCollapsedFaculties(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle opening assignment modal
  const openAssignModal = (student: DynamicStudentProfile) => {
    setSelectedStudent(student);
    setShowAssignModal(true);
  };

  // Handle assigning supervisor
  const handleAssign = (supervisorId: string) => {
    if (selectedStudent) {
      assignSupervisorToStudent(selectedStudent.id, supervisorId).catch((error: any) => {
        setFormError(error.message || 'Unable to assign supervisor.');
      });
    }
    setShowAssignModal(false);
    setSelectedStudent(null);
  };

  // Helper render method for active tab content
  const renderTabContent = () => {
    if (activeTab === 'SETTINGS') {
      return <SettingsTab />;
    }

    if (activeTab === 'STUDENTS') {
      return (
        <ScrollView style={styles.listScroller} contentContainerStyle={styles.listScrollerContent}>
          <View style={styles.actionBar}>
            <Text style={styles.sectionHeading}>Student-Supervisor Mapping</Text>
          </View>
          
          {Object.keys(groupedStudents).map(faculty => (
            <View key={faculty} style={styles.facultyBlock}>
              <TouchableOpacity
                style={styles.facultyHeader}
                onPress={() => toggleFaculty('students', faculty)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="business" size={18} color="#fabd00" />
                <Text style={styles.facultyTitle}>Faculty of {faculty}</Text>
                <Text style={styles.folderCount}>
                  {Object.values(groupedStudents[faculty]).reduce((total, students) => total + students.length, 0)}
                </Text>
                <MaterialIcons
                  name={isFacultyCollapsed('students', faculty) ? 'chevron-right' : 'expand-more'}
                  size={20}
                  color="#fabd00"
                />
              </TouchableOpacity>

              {!isFacultyCollapsed('students', faculty) && (
                <>
                  {Object.keys(groupedStudents[faculty]).map(dept => (
                    <View key={dept} style={styles.deptBlock}>
                      <Text style={styles.deptTitle}>Department of {dept}</Text>
                      
                      {groupedStudents[faculty][dept].map(student => {
                        const supervisor = supervisorsList.find(s => s.id === student.supervisorId);
                        return (
                          <View key={student.id} style={styles.studentCard}>
                            <View style={styles.studentInfo}>
                              <Text style={styles.studentName}>{student.fullName}</Text>
                              <Text style={styles.studentSub}>Matric: {student.matricNo}</Text>
                              <Text style={styles.studentSub}>Org: {student.organizationName}</Text>
                            </View>

                            <View style={styles.assignmentPanel}>
                              {supervisor ? (
                                <View style={styles.assignedBadge}>
                                  <View style={[styles.led, styles.ledGreen]} />
                                  <Text style={styles.assignedText}>Assigned: {supervisor.fullName}</Text>
                                </View>
                              ) : (
                                <View style={styles.unassignedBadge}>
                                  <View style={[styles.led, styles.ledYellow]} />
                                  <Text style={styles.unassignedText}>Unassigned</Text>
                                </View>
                              )}

                              <TouchableOpacity 
                                style={styles.assignBtn}
                                onPress={() => openAssignModal(student)}
                              >
                                <Text style={styles.assignBtnText}>{supervisor ? 'Reassign' : 'Assign Advisor'}</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </>
              )}
            </View>
          ))}
        </ScrollView>
      );
    } else {
      return (
        <ScrollView style={styles.listScroller} contentContainerStyle={styles.listScrollerContent}>
          <View style={styles.actionBar}>
            <Text style={styles.sectionHeading}>Registered Faculty/Staff</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => setShowAddSupervisorModal(true)}
            >
              <MaterialIcons name="person-add" size={16} color="#0f1511" />
              <Text style={styles.addBtnText}>Add Supervisor</Text>
            </TouchableOpacity>
          </View>

          {Object.keys(groupedSupervisors).map(faculty => (
            <View key={faculty} style={styles.facultyBlock}>
              <TouchableOpacity
                style={styles.facultyHeader}
                onPress={() => toggleFaculty('supervisors', faculty)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="folder" size={18} color="#fabd00" />
                <Text style={styles.facultyTitle}>Faculty of {faculty}</Text>
                <Text style={styles.folderCount}>{groupedSupervisors[faculty].length}</Text>
                <MaterialIcons
                  name={isFacultyCollapsed('supervisors', faculty) ? 'chevron-right' : 'expand-more'}
                  size={20}
                  color="#fabd00"
                />
              </TouchableOpacity>

              {!isFacultyCollapsed('supervisors', faculty) && (
                <>
                  {groupedSupervisors[faculty].map(sup => (
                    <View key={sup.id} style={styles.supCard}>
                      <View style={styles.supHeaderRow}>
                        <View>
                          <Text style={styles.supName}>{sup.fullName}</Text>
                          <Text style={styles.supSub}>Staff ID: {sup.staffId}</Text>
                        </View>
                        <View style={[styles.typeBadge, sup.supervisorType === 'ACADEMIC' ? styles.badgeAcademic : styles.badgeIndustry]}>
                          <Text style={styles.typeBadgeText}>{sup.supervisorType}</Text>
                        </View>
                      </View>
                      <View style={styles.supBody}>
                        <Text style={styles.supDetail}><Text style={styles.boldText}>Dept:</Text> {sup.department}</Text>
                        <Text style={styles.supDetail}><Text style={styles.boldText}>Designation:</Text> {sup.designation}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          ))}
        </ScrollView>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Metrics Row (only display on main lists, hide on settings tab for cleaner look) */}
      {activeTab !== 'SETTINGS' && (
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <MaterialIcons name="people" size={20} color="#77da9f" />
            <Text style={styles.metricValue}>{totalStudents}</Text>
            <Text style={styles.metricLabel}>Total Students</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialIcons name="assignment-ind" size={20} color="#fabd00" />
            <Text style={styles.metricValue}>{totalSupervisors}</Text>
            <Text style={styles.metricLabel}>Supervisors</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialIcons name="verified" size={20} color="#95d4ac" />
            <Text style={styles.metricValue}>{assignmentRate}%</Text>
            <Text style={styles.metricLabel}>Mapping Rate</Text>
          </View>
        </View>
      )}

      {/* Main Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Tactile Forest Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('STUDENTS')}
          style={[styles.tabButton, activeTab === 'STUDENTS' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="school"
            size={18}
            color={activeTab === 'STUDENTS' ? '#ffffff' : '#77da9f'}
          />
          <Text style={[styles.tabText, activeTab === 'STUDENTS' && styles.tabTextActive]}>
            Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('SUPERVISORS')}
          style={[styles.tabButton, activeTab === 'SUPERVISORS' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="supervised-user-circle"
            size={18}
            color={activeTab === 'SUPERVISORS' ? '#ffffff' : '#77da9f'}
          />
          <Text style={[styles.tabText, activeTab === 'SUPERVISORS' && styles.tabTextActive]}>
            Supervisors
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

      {/* Add Supervisor Modal */}
      <Modal
        visible={showAddSupervisorModal}
        transparent
        animationType="fade"
        onRequestClose={closeAddSupervisorModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Supervisor</Text>
              <TouchableOpacity onPress={closeAddSupervisorModal}>
                <MaterialIcons name="close" size={20} color="#c0c9c0" />
              </TouchableOpacity>
            </View>

            {formError ? <Text style={styles.errorText}>⚠️ {formError}</Text> : null}

            {formSuccess ? <Text style={styles.successText}>{formSuccess}</Text> : null}

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputRecess}>
                  <TextInput 
                    value={supName} 
                    onChangeText={setSupName} 
                    placeholder="e.g. Dr. Charity Onyiyechi" 
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Login Email</Text>
                <View style={styles.inputRecess}>
                  <TextInput
                    value={supEmail}
                    onChangeText={setSupEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="e.g. supervisor@university.edu.ng"
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Temporary Password</Text>
                <View style={styles.inputRecess}>
                  <TextInput
                    value={supPassword}
                    onChangeText={setSupPassword}
                    autoCapitalize="none"
                    placeholder="At least 6 characters"
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Staff ID / Code</Text>
                <View style={styles.inputRecess}>
                  <TextInput 
                    value={supStaffId} 
                    onChangeText={setSupStaffId} 
                    placeholder="e.g. COOU/CS/2018/042" 
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Faculty</Text>
                <View style={styles.inputRecess}>
                  <TextInput 
                    value={supFaculty} 
                    onChangeText={setSupFaculty} 
                    placeholder="e.g. Physical Sciences" 
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department</Text>
                <View style={styles.inputRecess}>
                  <TextInput 
                    value={supDepartment} 
                    onChangeText={setSupDepartment} 
                    placeholder="e.g. Computer Science" 
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Designation / Role Title</Text>
                <View style={styles.inputRecess}>
                  <TextInput 
                    value={supDesignation} 
                    onChangeText={setSupDesignation} 
                    placeholder="e.g. Senior Lecturer / Coordinator" 
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Supervisor Classification</Text>
                <View style={styles.radioRow}>
                  <TouchableOpacity 
                    style={[styles.radioOption, supType === 'ACADEMIC' && styles.radioOptionActive]}
                    onPress={() => setSupType('ACADEMIC')}
                  >
                    <Text style={[styles.radioText, supType === 'ACADEMIC' && styles.radioTextActive]}>Academic Advisor</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioOption, supType === 'INDUSTRY' && styles.radioOptionActive]}
                    onPress={() => setSupType('INDUSTRY')}
                  >
                    <Text style={[styles.radioText, supType === 'INDUSTRY' && styles.radioTextActive]}>Industry Partner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalSubmitBtn, submittingSupervisor && styles.modalSubmitBtnDisabled]}
              onPress={handleRegisterSupervisor}
              disabled={submittingSupervisor}
            >
              {submittingSupervisor ? (
                <ActivityIndicator size="small" color="#0f1511" />
              ) : (
                <Text style={styles.modalSubmitText}>Create Supervisor Credentials</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assign Supervisor Modal */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAssignModal(false);
          setSelectedStudent(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Academic Advisor</Text>
                <Text style={styles.modalSubtitle}>{selectedStudent?.fullName}</Text>
              </View>
              <TouchableOpacity onPress={() => {
                setShowAssignModal(false);
                setSelectedStudent(null);
              }}>
                <MaterialIcons name="close" size={20} color="#c0c9c0" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={supervisorsList}
              keyExtractor={item => item.id}
              style={{ maxHeight: 300, marginVertical: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.assignOptionCard, 
                    selectedStudent?.supervisorId === item.id && styles.assignOptionActive
                  ]}
                  onPress={() => handleAssign(item.id)}
                >
                  <View style={styles.assignOptionHeader}>
                    <Text style={styles.assignOptionName}>{item.fullName}</Text>
                    <Text style={styles.assignOptionType}>{item.supervisorType}</Text>
                  </View>
                  <Text style={styles.assignOptionDept}>{item.department} • {item.designation}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1511',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#77da9f',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#77da9f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f1511',
  },
  listScroller: {
    flex: 1,
  },
  listScrollerContent: {
    gap: 16,
    paddingBottom: 24,
  },
  facultyBlock: {
    backgroundColor: '#131915',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  facultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
  },
  facultyTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fabd00',
  },
  folderCount: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(250, 189, 0, 0.12)',
    color: '#fabd00',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deptBlock: {
    gap: 8,
    paddingLeft: 4,
  },
  deptTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#95d4ac',
    marginBottom: 4,
  },
  studentCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1.2,
    gap: 2,
  },
  studentName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  studentSub: {
    fontSize: 10,
    color: '#c0c9c0',
  },
  assignmentPanel: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(25, 135, 84, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  unassignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250, 189, 0, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  led: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ledGreen: {
    backgroundColor: '#77da9f',
  },
  ledYellow: {
    backgroundColor: '#fabd00',
  },
  assignedText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#77da9f',
  },
  unassignedText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fabd00',
  },
  assignBtn: {
    backgroundColor: '#232d26',
    borderWidth: 1,
    borderColor: '#0f5132',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  assignBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  supCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  supHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  supName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  supSub: {
    fontSize: 10,
    color: '#c0c9c0',
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeAcademic: {
    backgroundColor: 'rgba(119, 218, 159, 0.1)',
  },
  badgeIndustry: {
    backgroundColor: 'rgba(250, 189, 0, 0.1)',
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  supBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 8,
    gap: 2,
  },
  supDetail: {
    fontSize: 11,
    color: '#c0c9c0',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 450,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#77da9f',
    marginTop: 2,
  },
  modalBody: {
    maxHeight: 400,
  },
  errorText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffb4ab',
  },
  successText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#77da9f',
    lineHeight: 16,
  },
  inputGroup: {
    gap: 6,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  inputRecess: {
    backgroundColor: '#0f1511',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 13,
    color: '#ffffff',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  radioOption: {
    flex: 1,
    backgroundColor: '#0f1511',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  radioOptionActive: {
    borderColor: '#77da9f',
    backgroundColor: 'rgba(119, 218, 159, 0.05)',
  },
  radioText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#c0c9c0',
  },
  radioTextActive: {
    color: '#77da9f',
  },
  modalSubmitBtn: {
    backgroundColor: '#77da9f',
    borderRadius: 8,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitBtnDisabled: {
    opacity: 0.7,
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f1511',
  },
  assignOptionCard: {
    backgroundColor: '#0f1511',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  assignOptionActive: {
    borderColor: '#77da9f',
    backgroundColor: 'rgba(119, 218, 159, 0.03)',
  },
  assignOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignOptionName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  assignOptionType: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#77da9f',
    textTransform: 'uppercase',
  },
  assignOptionDept: {
    fontSize: 10,
    color: '#c0c9c0',
    marginTop: 4,
  },
});

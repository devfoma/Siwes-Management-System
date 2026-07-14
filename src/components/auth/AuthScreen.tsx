import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../interfaces/types';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  
  // Auth screen active mode toggle
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Primary fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('STUDENT');

  // Role details
  const [matricNo, setMatricNo] = useState<string>('');
  const [staffId, setStaffId] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');
  const [orgAddress, setOrgAddress] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');

  const handleAction = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password fields are required.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    if (isSignUpMode) {
      if (!fullName.trim() || !department.trim()) {
        setErrorMsg('Name and department fields are required.');
        setLoading(false);
        return;
      }
      
      const roleData = role === 'STUDENT' 
        ? { matricNo, department, organizationName: orgName, organizationAddress: orgAddress }
        : { staffId, department, designation };

      const { error } = await signUp(email, password, fullName, role, roleData);
      if (error) {
        setErrorMsg(error.message || 'Signup failed. Please try again.');
      } else {
        // Sign up automatically triggers verification emails
        setErrorMsg('Registration successful! Please check your email for verification.');
        setIsSignUpMode(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Incorrect credentials.');
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand visual header */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="school" size={32} color="#95d4ac" />
          </View>
          <Text style={styles.brandTitle}>SIWES Connect</Text>
          <Text style={styles.brandSub}>AI-Enhanced Industrial Work Management</Text>
        </View>

        {/* Auth form container */}
        <View style={styles.formCard}>
          {/* Mode Switch Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => {
                setIsSignUpMode(false);
                setErrorMsg('');
              }}
              style={[styles.tab, !isSignUpMode && styles.tabActive]}
            >
              <Text style={[styles.tabText, !isSignUpMode && styles.tabTextActive]}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsSignUpMode(true);
                setErrorMsg('');
              }}
              style={[styles.tab, isSignUpMode && styles.tabActive]}
            >
              <Text style={[styles.tabText, isSignUpMode && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Error notice */}
          {errorMsg ? (
            <Text style={errorMsg.includes('successful') ? styles.successText : styles.errorText}>
              {errorMsg}
            </Text>
          ) : null}

          {/* Form fields */}
          <View style={styles.fieldsContainer}>
            {isSignUpMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.recessedInput}>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Faith Amarachi"
                    placeholderTextColor="#666"
                    style={styles.textInput}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.recessedInput}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="name@university.edu.ng"
                  placeholderTextColor="#666"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.recessedInput}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Sign Up Role Specific Fields */}
            {isSignUpMode && (
              <>
                {/* Role selection tab */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Registering Role</Text>
                  <View style={styles.roleTabsRow}>
                    <TouchableOpacity
                      onPress={() => setRole('STUDENT')}
                      style={[styles.roleTab, role === 'STUDENT' && styles.roleTabActive]}
                    >
                      <Text style={[styles.roleTabText, role === 'STUDENT' && styles.roleTabTextActive]}>
                        Student
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setRole('SUPERVISOR')}
                      style={[styles.roleTab, role === 'SUPERVISOR' && styles.roleTabActive]}
                    >
                      <Text style={[styles.roleTabText, role === 'SUPERVISOR' && styles.roleTabTextActive]}>
                        Supervisor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {role === 'STUDENT' ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Matric Number</Text>
                      <View style={styles.recessedInput}>
                        <TextInput
                          value={matricNo}
                          onChangeText={setMatricNo}
                          placeholder="2022 224 152"
                          placeholderTextColor="#666"
                          style={styles.textInput}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Department</Text>
                      <View style={styles.recessedInput}>
                        <TextInput
                          value={department}
                          onChangeText={setDepartment}
                          placeholder="Computer Science"
                          placeholderTextColor="#666"
                          style={styles.textInput}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Placement Organisation Name</Text>
                      <View style={styles.recessedInput}>
                        <TextInput
                          value={orgName}
                          onChangeText={setOrgName}
                          placeholder="Stitch Emerald Technologies"
                          placeholderTextColor="#666"
                          style={styles.textInput}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Organisation Office Address</Text>
                      <View style={styles.recessedInput}>
                        <TextInput
                          value={orgAddress}
                          onChangeText={setOrgAddress}
                          placeholder="12 Awolowo Road, Ikoyi, Lagos"
                          placeholderTextColor="#666"
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Staff ID Number</Text>
                      <View style={styles.recessedInput}>
                        <TextInput
                          value={staffId}
                          onChangeText={setStaffId}
                          placeholder="COOU/CS/2018/042"
                          placeholderTextColor="#666"
                          style={styles.textInput}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Academic Department</Text>
                      <View style={styles.recessedInput}>
                        <TextInput
                          value={department}
                          onChangeText={setDepartment}
                          placeholder="Computer Science"
                          placeholderTextColor="#666"
                          style={styles.textInput}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Academic Designation</Text>
                      <View style={styles.recessedInput}>
                        <TextInput
                          value={designation}
                          onChangeText={setDesignation}
                          placeholder="Senior Lecturer / SIWES Coordinator"
                          placeholderTextColor="#666"
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          {/* Action Trigger Button */}
          <TouchableOpacity
            onPress={handleAction}
            disabled={loading}
            style={styles.submitBtn}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isSignUpMode ? 'Register Account' : 'Authenticate credentials'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1511',
  },
  scrollContent: {
    padding: 24,
    gap: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1b211d',
    borderWidth: 2,
    borderColor: '#0f5132',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 11,
    color: '#95d4ac',
    textAlign: 'center',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#1b211d',
    borderWidth: 1,
    borderColor: '#0f5132',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0a100c',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#198754',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c0c9c0',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  errorText: {
    fontSize: 11,
    color: '#ffb4ab',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successText: {
    fontSize: 11,
    color: '#77da9f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fieldsContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c0c9c0',
    textTransform: 'uppercase',
  },
  recessedInput: {
    backgroundColor: '#0a100c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    height: 40,
    justifyContent: 'center',
  },
  textInput: {
    color: '#ffffff',
    fontSize: 13,
  },
  roleTabsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a100c',
    borderRadius: 8,
    height: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  roleTabActive: {
    borderColor: '#95d4ac',
    backgroundColor: 'rgba(149, 212, 172, 0.1)',
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#c0c9c0',
  },
  roleTabTextActive: {
    color: '#95d4ac',
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#198754',
    borderRadius: 8,
    height: 44,
    borderBottomWidth: 3,
    borderBottomColor: '#082d1c',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

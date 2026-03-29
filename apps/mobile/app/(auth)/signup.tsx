import { auth } from '@/services/firebaseConfig';
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created!");
    } catch (error: any) {
      Alert.alert("Signup Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
        Create Account
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15 }}
      />

      <TouchableOpacity 
        onPress={handleSignup}
        style={{ backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Link href="/login">
          <Text style={{ color: '#007AFF' }}>Already have an account? Login</Text>
        </Link>
      </View>
    </View>
  );
}
import { auth } from '@/services/firebaseConfig';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Welcome back!");
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
        Welcome Back
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
        onPress={handleLogin}
        style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Link href="/signup">
          <Text style={{ color: '#007AFF' }}>Need an account? Sign Up</Text>
        </Link>
      </View>
    </View>
  );
}
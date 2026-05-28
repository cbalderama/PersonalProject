import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { signIn } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      Alert.alert('Success', 'Welcome back!');
      // Navigation handled by auth state listener in _layout
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
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
        editable={!loading}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15 }}
      />

      <TouchableOpacity 
        onPress={handleLogin}
        disabled={loading}
        style={{ 
          backgroundColor: loading ? '#cccccc' : '#007AFF', 
          padding: 15, 
          borderRadius: 10, 
          alignItems: 'center' 
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Link href="/signup">
          <Text style={{ color: '#007AFF' }}>Need an account? Sign Up</Text>
        </Link>
      </View>
    </View>
  );
}
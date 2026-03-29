import { auth } from '@/services/firebaseConfig';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optional: Alert.alert("Signed Out", "See you next time!");
      
      // Note: You don't technically NEED router.replace here because 
      // our _layout.tsx "Gatekeeper" will handle the redirect automatically!
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        Welcome to the App!
      </Text>
      
      <Text style={{ color: '#666', marginBottom: 30 }}>
        You are currently logged in as: {auth.currentUser?.email}
      </Text>

      <TouchableOpacity 
        onPress={handleLogout}
        style={{ 
          backgroundColor: '#FF3B30', // Red for logout
          paddingVertical: 12, 
          paddingHorizontal: 30, 
          borderRadius: 8 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
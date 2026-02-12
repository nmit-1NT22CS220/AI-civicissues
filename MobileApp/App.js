import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './src/styles/theme';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import SubmissionScreen from './src/screens/SubmissionScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import ComplaintDetailScreen from './src/screens/ComplaintDetailScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const uid = await AsyncStorage.getItem('user_uid');
      if (uid) {
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="Dashboard">
            {(props) => <DashboardScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </AppStack.Screen>
          <AppStack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
          <AppStack.Screen name="Camera" component={CameraScreen} />
          <AppStack.Screen name="Preview" component={PreviewScreen} />
          <AppStack.Screen name="Submission" component={SubmissionScreen} />
          <AppStack.Screen name="Success" component={SuccessScreen} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

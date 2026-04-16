import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(uid: string) {
  let token;

  if (Platform.OS === 'web') {
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'firmados-em-cristo', // This should match your app config
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (token && uid) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { pushToken: token });
  }

  return token;
}

export async function sendPushNotification(title: string, body: string) {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const tokens: string[] = [];
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.pushToken) {
        tokens.push(data.pushToken);
      }
    });

    if (tokens.length === 0) return;

    // Expo Push API
    const message = tokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: { someData: 'goes here' },
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Error sending push notification: ' + (error instanceof Error ? error.message : String(error)));
  }
}

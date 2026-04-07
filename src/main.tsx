import {AppRegistry} from 'react-native';
import App from './App.tsx';
import './index.css';

// Register the app for React Native Web
AppRegistry.registerComponent('App', () => App);

// Run the application
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root')!,
});

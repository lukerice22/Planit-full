// src/navigation/Navigation.tsx
import { NavigationContainer } from '@react-navigation/native';
import AppStack from './AppStack';

export default function Navigation() {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}

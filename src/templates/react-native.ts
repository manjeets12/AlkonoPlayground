export const reactNativeMain = `import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from './src/components/Button';

export default function Main() {
  const handlePress = () => alert('Hello from src/components/Button!');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.h1}>Hello World (React Native)</Text>
        <Text style={styles.h2}>Tap to interact</Text>
        <Text style={styles.p}>
          This is a React Native component running in the integrated execution environment!
        </Text>
        
        <View style={{ marginTop: 24 }}>
          <Button label="Click Me" onPress={handlePress} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  h2: {
    fontSize: 24,
    color: '#94a3b8',
    margin: 0,
  },
  p: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 20,
  },
});
`;

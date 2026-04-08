import type { FileMap } from "../types/framework";


export const sharedFiles: FileMap = {
  "App.tsx": `import React from 'react';
import Main from './main';

export default function App() {
  return <Main />;
}
`,

  "src/components/Button.tsx": `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.base, variant === 'secondary' && styles.secondary]}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  secondary: {
    backgroundColor: '#1e293b',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
`,

  "src/utils/helpers.ts": `export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
`,
};


export const reactMain = `import React from 'react';
import { Button } from './src/components/Button';

export default function Main() {
  const handlePress = () => alert('Hello from src/components/Button!');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
      <h1 style={{ fontSize: '32px', margin: 0 }}>Hello World (32px)</h1>
      <h2 style={{ fontSize: '24px', margin: 0, color: '#94a3b8' }}>Hello World (24px)</h2>
      <h3 style={{ fontSize: '16px', margin: 0, color: '#64748b' }}>Hello World (16px)</h3>
      <p style={{ marginTop: '20px' }}>
        This is a standard React execution running perfectly in the integrated execution environment!
      </p>
      
      <div style={{ marginTop: '20px' }}>
        <Button label="Click Me" onPress={handlePress} />
      </div>
    </div>
  );
}
`;

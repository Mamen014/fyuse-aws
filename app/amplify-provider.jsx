// app/amplify-provider.jsx
'use client';

import { ThemeProvider, Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function AmplifyWrapper({ children }) {
  return (
    <ThemeProvider>
      <Authenticator.Provider>
        {children}
      </Authenticator.Provider>
    </ThemeProvider>  
  );
}
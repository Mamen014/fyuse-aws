// src/lib/initAmplify.js
'use client';
import { Amplify } from 'aws-amplify';
import config from '../aws-exports';
Amplify.configure(config);

Amplify.configure({
  Auth: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_umlmIR2ch',
    userPoolWebClientId: '1ia5d5qktqtr3jdc1vkl0gjvo1',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
});
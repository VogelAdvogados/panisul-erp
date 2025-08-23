import { getApps, initializeApp, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK for server-side use
let app: App;
try {
  app = getApps().length
    ? getApps()[0]
    : initializeApp({
        // Use explicit credentials if provided, otherwise fall back to default application credentials
        credential: process.env.FIREBASE_CLIENT_EMAIL
          ? cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
          : applicationDefault(),
      });
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK.', error);
  // Initialize with default credentials to avoid runtime crashes in development
  app = initializeApp({ credential: applicationDefault() });
}

const adminDb: Firestore = getFirestore(app);

export { adminDb };

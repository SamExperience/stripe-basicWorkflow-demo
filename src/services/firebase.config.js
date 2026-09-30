const env = import.meta.env;

const required = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

const missing = Object.values(required).filter((name) => !env[name]);
if (missing.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missing.join(", ")}. ` +
      "Copy .env.example to .env.local and fill in the values.",
  );
}

export const firebaseConfig = Object.fromEntries(
  Object.entries(required).map(([key, name]) => [key, env[name]]),
);

import admin from "firebase-admin";

if (!process.env.FIREBASE_ADMIN) {
    throw new Error("Env FIREBASE_ADMIN not defined");
}

const creds = admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN));

admin.initializeApp({
    credential: creds,
});

export const fireAuth = admin.auth();

# Firebase To Do List App (React)

Covers all Task 6 requirements:

- Sign up with email & password (stored in Firebase Auth + Firestore `users` collection)
- Login with email/password — checked against Firebase
- Create named To Do Lists
- Add tasks with **Title, Description, Due date, Priority** — all saved in Firestore
- **Drag & drop** tasks between lists
- **Drag & drop** to reorder tasks / change priority position within a list (priority level can also be changed via the dropdown on each card)

## Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. **Authentication → Sign-in method → Email/Password → Enable**.
3. **Firestore Database → Create database** (start in test mode for development).
4. **Project Settings → General → Your apps → Web app (</>)** — register an app and copy the config object.
5. Paste your config into `src/firebase.js` (replace the `YOUR_...` placeholders).

## Run

```bash
npm install
npm run dev
```

Open the printed localhost URL.

## Recommended Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /lists/{id} {
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    match /tasks/{id} {
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

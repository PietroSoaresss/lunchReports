# Lunch System - Registro de Almoco

## Requisitos

- Node.js 18+
- Firebase CLI

## Credenciais Firebase

- O arquivo `almocosagross-firebase-adminsdk-*.json` e uma credencial **Admin SDK** (backend).
- Para o frontend (`src/services/firebase.js`), voce ainda precisa dos dados da **Web App** no Firebase Console:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- O `projectId` ja foi configurado para `almocosagross`.

## Setup

1. Instale dependencias do frontend:
   `npm install`
2. Instale dependencias das functions:
   `cd functions && npm install`
3. Copie `.env.example` para `.env` e preencha as variaveis que faltam.
4. O `.firebaserc` ja aponta para o project id `almocosagross`.

## Desenvolvimento

- Frontend: `npm run dev`
- Emulador Functions: `cd functions && npm run serve`

## Deploy

1. Build frontend: `npm run build`
2. Deploy completo: `firebase deploy`
3. Deploy parcial:
   - `firebase deploy --only functions`
   - `firebase deploy --only hosting`
   - `firebase deploy --only firestore:rules`

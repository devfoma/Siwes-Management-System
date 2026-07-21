# SIWES Connect

SIWES Connect is a React Native / Expo application for managing the Student Industrial Work Experience Scheme with real student logbooks, supervisor review, admin assignment, AI-assisted entry review, and WebRTC video supervision.

## Core Capabilities

- Student signup, login, profile-backed placement details, and logbook submission.
- Supervisor dashboards populated from assigned students in Supabase.
- Admin views for student/supervisor mapping.
- Persistent logbook approvals, feedback, report export, and realtime refresh.
- WebRTC camera/microphone calls using `react-native-webrtc` with Supabase Realtime broadcast signaling.
- Persistent in-call chat through the `call_messages` table.
- Configurable AI review service through `EXPO_PUBLIC_AI_ANALYSIS_URL`.

## Production Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env`:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_AI_ANALYSIS_URL=https://your-ai-service.example.com/analyze-logbook
   EXPO_PUBLIC_ADMIN_API_URL=https://your-admin-api.example.com
   ```

3. Run the Supabase schema in `supabase/schema.sql` from the Supabase SQL editor or your migration pipeline.

4. Provision admin/supervisor accounts through a trusted backend. The mobile app intentionally does not create privileged supervisor auth users directly because that requires a service-role key.

5. Build with a native development build or production build for WebRTC. `react-native-webrtc` native modules do not run inside plain Expo Go.

## Commands

```bash
npm run start
npm run android
npm run ios
npm run typecheck
npm run doctor
```

On Windows PowerShell, use `npm.cmd run typecheck` if script execution policy blocks `npm`.

## Notes

- The current SDK is Expo 54, with the matching WebRTC config plugin pinned to `@config-plugins/react-native-webrtc@13`.
- The app uses manual React state navigation, not Expo Router.
- AI analysis is no longer a local mock in the submission flow. Configure `EXPO_PUBLIC_AI_ANALYSIS_URL` to enable live analysis.

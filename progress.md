# Cầu Lông 360° Rebuild - Progress Report

## What has been accomplished so far:

1. **Backend API Fully Rebuilt (Phases 1-4 & 7):**
   - Implemented a secure Express API powered by Drizzle ORM and SQLite.
   - Built a custom **Auth Middleware** layer preventing Insecure Direct Object References (IDOR). Each group's data is strictly isolated to its respective `HOST`.
   - Setup API routes for `Auth`, `Members`, `Sessions`, `Matches`, and `Settings`.
   - Wrote a full, automated Vitest suite (`api.test.ts`) that runs 24 end-to-end tests ensuring data segregation works perfectly and the auth workflow is solid.

2. **Matching Engine Ported (Phase 6):**
   - Transferred `matchingEngine.ts` to the backend and integrated it as a POST route `api/sessions/:id/suggest-match`.
   - The engine automatically retrieves players from the database directly, enforcing integrity and simplifying the payload size.

3. **Frontend Integration Started (Phase 5):**
   - Implemented `ApiClient` in `src/lib/api.ts` to automatically handle JSON Web Tokens for API requests.
   - Built an `AuthContext` to protect routes and handle the user's login state.
   - Designed a new `LoginPage` component.
   - Rewired `App.tsx` to handle authentication routing.
   - Converted `usePlayers.ts` to fully communicate with the `GET /api/members` and `POST/PUT/DELETE /api/members` endpoints.
   - Refactored `PlayersPage.tsx` to utilize the new server-provided `careerMatches` statistic (bypassing the need for manual `StorageService` history calculations).
   - Re-wrote `useSettings.ts` to save and read settings from `/api/settings`.

## Next Steps (Remaining Phase 5 items):
We need to refactor the most complex hooks remaining:
1. `useSession.ts` - Needs to be wired up to `/api/sessions` to handle court assignments and match finalizations via the backend API.
2. `useHistory.ts` (or equivalent data fetching in `HistoryPage.tsx`) - Needs to grab past sessions from the server instead of `localStorage`.
3. Drop all references to `localStorage` and `StorageService` fully once the UI is verified working against the API.

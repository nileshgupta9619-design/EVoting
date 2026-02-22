# E-Voting Backend API

Node.js and MongoDB based e-voting system with email OTP authentication.

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB URI
   - JWT Secret
   - Email credentials (Gmail)
   - Vote encryption key and secrets (see `.env.example`)

- Firebase service account values for document uploads

## Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Voting

- `GET /api/voting/candidates` - Get all candidates
- `GET /api/voting/candidates/:id` - Get candidate by ID
- `POST /api/voting/vote` - Cast vote (protected)
- `GET /api/voting/results` - Get voting results
- `POST /api/voting/candidates` - Create candidate (admin only)
- `DELETE /api/voting/candidates/:id` - Delete candidate (admin only)

### Candidate Profiles (new)

- `POST /api/candidate-profiles/submit` - Submit candidate request (authenticated, voter must be admin-approved)
- `GET /api/candidate-profiles/my-profile` - Get logged-in user's candidate profile
- `PUT /api/candidate-profiles/:profileId` - Update own profile (only when pending)
- `GET /api/candidate-profiles/approved?electionId=...` - Get approved candidates for an election
- `GET /api/candidate-profiles/pending` - Admin only: list pending profiles
- `PUT /api/candidate-profiles/:profileId/approve` - Admin: approve profile
- `PUT /api/candidate-profiles/:profileId/reject` - Admin: reject profile

### Elections

- `GET /api/elections` - List elections (authenticated voters only)
- `GET /api/elections/:electionId` - Get election details (authenticated voters only)
- `GET /api/elections/:electionId/candidates` - Get approved candidates for election (authenticated voters only)
- `POST /api/elections` - Create election (admin only)
- `PUT /api/elections/:electionId/start` - Start voting (admin only)
- `PUT /api/elections/:electionId/stop` - Stop voting (admin only)
- `GET /api/elections/:electionId/results` - Get election results (only available after election stopped)

### Voting (per-election anon votes)

- `POST /api/voting/election/:electionId/vote` - Cast vote for an approved candidate profile in an active election (authenticated, voter-approved)
- `GET /api/voting/election/:electionId/has-voted` - Check if current user has voted in that election

### Admin

- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - List users (admin)
- `PUT /api/admin/users/:userId/approve` - Approve a voter
- `PUT /api/admin/users/:userId/reject` - Reject a voter
- `PUT /api/admin/users/:userId/assign-election` - Assign a voter to an election
- `POST /api/admin/create` - Create admin by existing admin
- `GET /api/admin/logs` - Get audit logs (admin)

## Security & Important Notes

- Votes are stored encrypted and anonymously (encrypted candidate token + voter hash) to protect voter identity.
- Only admin-approved voters may view elections/candidates and vote.
- Results are not visible while an election is active; admin must stop the election to publish results.
- Audit logs record all admin actions (approve/reject/start/stop/create/delete) and are stored in `AuditLog` model.
- Backups: run `npm run backup:votes` to export encrypted vote dumps with checksum. Schedule daily backups with OS scheduler.

## Frontend updates

You must update the frontend to use the per-election routes and to respect voter approval state:

- Only show elections and candidate lists after the user is `isApproved`.
- Cast votes with `POST /api/voting/election/:electionId/vote` using `candidateProfileId`.
- Use `GET /api/elections/:electionId/results` only after admin stopped the election.

I updated the frontend API helper to include the new endpoints; update UI pages to call these routes and to show pending/approved state accordingly.

## Environment variables (new)

Please set these additional variables in your `.env` (see `.env.example`):

- `VOTE_ENCRYPTION_KEY` — AES-256 key in hex (32 bytes)
- `VOTER_HASH_SECRET` — HMAC secret for voter hashing
- `BACKUP_ENCRYPTION_KEY` — AES key to encrypt backup files
- Firebase service account fields: `FIREBASE_*` (for secure document uploads and time-limited URLs)

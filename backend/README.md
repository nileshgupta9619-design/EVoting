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

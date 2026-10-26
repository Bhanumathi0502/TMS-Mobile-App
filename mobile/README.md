# TMS – React Native Frontend

This mobile frontend was converted from the supplied React + Node.js + Express + MongoDB project to match the MCA III Semester requirement.

## Technology

- React Native UI using Expo
- Existing Node.js + Express backend
- Existing MongoDB database
- JWT authentication
- Multer complaint attachments

## Requirement Mapping

### Week 1–3
- JWT Login
- SuperAdmin bootstrap through backend/Postman
- SuperAdmin-only master screens:
  - Department
  - Programme
  - Block
  - Room Number
  - Role
  - User

### Week 4
- Complaint Raising
- Block
- Room Number
- Complaint Type
- Remarks
- Attachment
- User details displayed from authenticated token
- Only User and SuperAdmin can raise complaints

### Week 5
- Dashboard:
  - Total
  - Pending
  - Assigned
  - Closed
- Role-based complaint list

### Week 6–8
- SuperAdmin: view all + assign/reassign
- Staff: only assigned complaints + status update
- User: only own complaints, no assignment/status permission
- Staff status:
  - In-Progress
  - Onhold
  - Completed

### Week 9
- SuperAdmin-only Complaint Details Report
- Filters:
  - Department
  - Programme
  - Complaint Type
  - Status
  - Assignee

## Run Backend

```bash
cd backend
npm install
copy .env.example .env
```

Set `.env`:

```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/tms_db
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```

Start MongoDB and then:

```bash
npm run dev
```

## Run React Native

```bash
cd mobile
npm install
npx expo start
```

### Android Emulator

The default mobile API URL is:

```text
http://10.0.2.2:5000/api
```

Press `a` in the Expo terminal.

### Physical Android Phone

Open:

```text
mobile/src/api.js
```

Change:

```js
export const API_BASE_URL = "http://10.0.2.2:5000/api";
```

to your PC's local IPv4:

```js
export const API_BASE_URL = "http://192.168.1.10:5000/api";
```

Your phone and PC must be on the same Wi-Fi.

## SuperAdmin

The backend already supports:

```text
POST /api/auth/bootstrap-superadmin
```

or:

```text
POST /api/auth/login
```

Use Postman for the college requirement if preferred.

## Important

The original web frontend is retained in:

```text
frontend-web-reference/
```

The required React Native frontend is:

```text
mobile/
```

The backend remains:

```text
backend/
```

## Dashboard UI upgrade

The dashboard has been upgraded with an enterprise service-desk UI while keeping the existing backend endpoints and authentication flow unchanged. It includes live statistics, loading states, pull-to-refresh, status filtering, professional empty states, recent complaint cards, role-aware actions and status badges.

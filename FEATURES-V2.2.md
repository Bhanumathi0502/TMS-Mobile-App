# TMS Version 2.2 – Final Feature Set

## Core workflow preserved
- JWT login and SuperAdmin bootstrap
- Role-based access control
- Master Screens: Department, Programme, Block, Room, Role and User
- User + SuperAdmin complaint raising
- SuperAdmin assignment/reassignment
- Staff status updates
- Complaint list and details
- Reports
- Profile, Settings and Logout

## Implemented features
1. Notifications – in-app notification center, unread count, mark read/all read, and notifications for raised/assigned/status/reopened complaints.
2. Priority + SLA – Low 48h, Medium 24h, High 8h, Critical 2h, with due time and breach indicators.
3. Complaint Timeline – history is stored and displayed with status, note, actor and time.
4. Reopen Complaint – owner or SuperAdmin can reopen completed/closed complaints; a new SLA window is created.
5. Advanced Charts – priority distribution and SLA-breach summary on the dashboard.
6. Staff Dashboard – staff see only assigned complaints and a **My Recent Complaints** section.
7. Search + Filters – complaint search plus status, priority and complaint-type filters.
8. PDF + Excel Reports – filtered report results can be shared as PDF or Excel-compatible XLS.
9. Feedback – completed complaint owners can submit a rating/comment.
10. Profile – image upload, edit name/email/phone, organization display and proper back navigation.
11. Organization – SuperAdmin assigns Department + Programme through Master Screens -> User -> Edit; values appear in the user's Profile.
12. Settings – notification preference, real Light/Dark mode and Change Password.
13. Safe-area aware navigation menu and status-bar handling.

## Dark mode
Dashboard, complaints, complaint details, reports, profile, edit profile, notifications and password screens use the active theme for backgrounds, cards, text, borders and controls.

## Setup
### Backend
1. Copy `.env.example` to `.env` and keep the variable name `MONGO_URL`.
2. Use your local/Atlas MongoDB connection string.
3. `npm install`
4. `npm run dev`

### Mobile
1. `npm install`
2. Set the PC LAN address in `mobile/src/api.js` when using a physical phone/Expo Go.
3. `npx expo start -c`

# Postman API Quick Guide

Base URL:
`http://localhost:5000/api`

## Create first SuperAdmin
POST `/auth/bootstrap-superadmin`

```json
{
  "name": "Super Admin",
  "phone": "9876543210",
  "email": "admin@gmail.com",
  "password": "Admin@123"
}
```

## Login
POST `/auth/login`

```json
{
  "email": "admin@gmail.com",
  "password": "Admin@123"
}
```

Copy `token` and set:

`Authorization: Bearer <token>`

## Master endpoints

- GET/POST `/masters/department`
- GET/POST `/masters/programme`
- GET/POST `/masters/block`
- GET/POST `/masters/room`
- GET/POST `/masters/role`
- GET/POST `/masters/user`

Only SuperAdmin can create/delete masters.

## Complaint endpoints

- GET `/complaints/dashboard`
- GET `/complaints`
- POST `/complaints`
- PUT `/complaints/:id/assign`
- PUT `/complaints/:id/status`

## Report

GET `/reports/complaints`

Filters:
`department`, `programme`, `complaintType`, `status`, `assignee`

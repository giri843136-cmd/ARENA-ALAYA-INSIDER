# Authentication & Authorization

- NextAuth.js with Prisma adapter
- Magic links + OAuth (Google)
- JWT sessions with role embedded
- Fine-grained RBAC with Permission enum
- Impersonation support for super admins
- Activity logging on all sign-ins and privileged actions

Roles: GUEST, USER, EDITOR, SENIOR_EDITOR, ADMIN, SUPER_ADMIN
Permissions: READ/WRITE/PUBLISH/DELETE on each major entity + special admin permissions.

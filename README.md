# IT Tests Platform

Full-stack platform for creating and taking IT tests with
authentication, role-based access, progress tracking, and admin panel.

🌐 Live Demo: [https://it-tests.buzz](https://it-tests.buzz)  
👤 Demo account:  
email: demo@test.com  
password: demo123  

[Use in Telegram](https://t.me/it_tests_relic_bot)

## Screenshots



<details>
  <summary>### Tests page</summary>

![Tests page](https://github.com/user-attachments/assets/98391210-1eb9-4e3c-85cb-4c024608f923)

</details>


### Categories page
![Categories page](https://github.com/user-attachments/assets/17a20416-14c4-4ab9-b3bf-e625c6566c32)

### Leaderboards page
![Leaderboards page](https://github.com/user-attachments/assets/838c1b80-1d42-4cfd-9bff-ee8e568ed4b1)

### Profile page
![Profile page](https://github.com/user-attachments/assets/78c3db54-3a47-460a-a9da-f18f3d68c3b4)

### Passing the test page
![Passing the test](https://github.com/user-attachments/assets/a18e1d4f-380a-43b4-a3de-fefc4c66fafd)

### Admin panel page
![Admin panel](https://github.com/user-attachments/assets/42d05fb9-fb2d-44ad-9e12-aace954d4221)

### Admin panel - tests page
![Admin tests](https://github.com/user-attachments/assets/f54c0d0e-ede7-47b1-a6c5-7724ce589af5)

### Admin panel - categories page
![Admin categories](https://github.com/user-attachments/assets/e997329d-0720-49c7-a2bc-53ef308c42fe)

### Admin panel - users page
![Admin users](https://github.com/user-attachments/assets/66a454d0-8a29-4c00-b287-3d8bd22ad925)

---

## Features

- **Authentication & Roles**: JWT-based authentication and role-based access control
- **Tests**:
  - CRUD for tests and questions
  - Server-side timer for test-taking
  - Progress tracking and user levels
- **Users**:
  - Profile with progress and stats
  - Role-based access
- **Admin Panel**:
  - Manage users, tests, and categories
- **Database**:
  - PostgreSQL integration with server-side API
- **Frontend**:
  - Responsive UI with Tailwind CSS
  - Form validation with Zod/Yup
- **Deployment & DevOps**:
  - Docker setup and VPS deployment
  - Optimized development environment

---

## Tech Stack

**Frontend:** Vue 3, Nuxt 4, TypeScript, Pinia, Tailwind CSS  
**Backend:** Node.js, Nitro, PostgreSQL  
**DevOps:** Docker, VPS deployment

---

## Architecture

- Nuxt SSR frontend
- REST API via Nitro server
- PostgreSQL database
- JWT authentication
- Role-based middleware protection

---

## Run Locally

1. Clone the repository:
```bash
git clone <repo-url>

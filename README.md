# IT Tests Platform

Full-stack platform for creating and passing IT tests with
authentication, role-based access, progress tracking, and admin panel.

🌐 Live Demo: https://it-tests.buzz
👤 Demo account:
email: demo@test.com
password: demo123

## Screenshots

### Tests page
<img width="1279" height="835" alt="image" src="https://github.com/user-attachments/assets/98391210-1eb9-4e3c-85cb-4c024608f923" />

### Categories page
<img width="1268" height="827" alt="image" src="https://github.com/user-attachments/assets/17a20416-14c4-4ab9-b3bf-e625c6566c32" />

### Leaderboards page
<img width="1292" height="753" alt="image" src="https://github.com/user-attachments/assets/838c1b80-1d42-4cfd-9bff-ee8e568ed4b1" />

### Profile page
<img width="1189" height="900" alt="image" src="https://github.com/user-attachments/assets/78c3db54-3a47-460a-a9da-f18f3d68c3b4" />

### Passing the test page
<img width="1218" height="743" alt="image" src="https://github.com/user-attachments/assets/a18e1d4f-380a-43b4-a3de-fefc4c66fafd" />

### Admin panel page
<img width="1901" height="879" alt="image" src="https://github.com/user-attachments/assets/42d05fb9-fb2d-44ad-9e12-aace954d4221" />

### Admin panel - tests page
<img width="1580" height="830" alt="image" src="https://github.com/user-attachments/assets/f54c0d0e-ede7-47b1-a6c5-7724ce589af5" />

### Admin panel - categories page
<img width="1588" height="866" alt="image" src="https://github.com/user-attachments/assets/e997329d-0720-49c7-a2bc-53ef308c42fe" />

### Admin panel - users page
<img width="1590" height="874" alt="image" src="https://github.com/user-attachments/assets/66a454d0-8a29-4c00-b287-3d8bd22ad925" />


## Features
- Implemented authentication, role-based access, and REST API for users and tests
- Developed a REST API for managing users and tests
- Built full CRUD functionality for tests and questions
- Created a user profile system with progress tracking and level mechanics
- Implemented a test-taking system with a server-side timer
- Developed an admin panel for managing users, tests, and content
- Integrated PostgreSQL database with a server-side API
- Built a responsive UI using Tailwind CSS
- Added form validation using Zod/Yup
- Configured and optimized the development environment
- Deployed the application to a VPS using Docker
- Integrated Telegram Web App for seamless authorization and application usage inside Telegram: t.me/it_tests_relic_bot


## Tech Stack

Frontend:
- Vue 3
- Nuxt 4
- TypeScript
- Pinia
- Tailwind CSS

Backend:
- Node.js
- Nitro
- PostgreSQL

DevOps:
- Docker
- VPS deployment

## Architecture

- Nuxt SSR frontend
- REST API via Nitro server
- PostgreSQL database
- JWT authentication
- Role-based middleware protection

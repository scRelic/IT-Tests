# IT Tests Platform 🚀

Full-stack platform for creating and passing IT tests with authentication, role-based access, progress tracking, and an advanced admin panel.

🌐 **Live Demo:** [it-tests.buzz](https://it-tests.buzz)  
👤 **Demo account:**
- **Email:** `demo@test.com`  
- **Password:** `demo123`  

🤖 **Telegram Web App:** [it_tests_relic_bot](https://t.me/it_tests_relic_bot)

---

## 📸 Screenshots

<details>
  <summary>User Experience (Tests, Categories, Profile)</summary>
  
  ![Tests page](https://github.com/user-attachments/assets/98391210-1eb9-4e3c-85cb-4c024608f923)
  ![Categories page](https://github.com/user-attachments/assets/17a20416-14c4-4ab9-b3bf-e625c6566c32)
  ![Leaderboards page](https://github.com/user-attachments/assets/838c1b80-1d42-4cfd-9bff-ee8e568ed4b1)
  ![Profile page](https://github.com/user-attachments/assets/78c3db54-3a47-460a-a9da-f18f3d68c3b4)
  ![Passing the test](https://github.com/user-attachments/assets/a18e1d4f-380a-43b4-a3de-fefc4c66fafd)
</details>

<details>
  <summary>Admin Panel (Tests, Users, Management)</summary>

  ![Admin panel](https://github.com/user-attachments/assets/42d05fb9-fb2d-44ad-9e12-aace954d4221)
  ![Admin tests](https://github.com/user-attachments/assets/f54c0d0e-ede7-47b1-a6c5-7724ce589af5)
  ![Admin categories](https://github.com/user-attachments/assets/e997329d-0720-49c7-a2bc-53ef308c42fe)
  ![Admin users](https://github.com/user-attachments/assets/66a454d0-8a29-4c00-b287-3d8bd22ad925)
  ![Edit test](https://github.com/user-attachments/assets/a60b331f-285d-418d-ad72-22357ab6f195)
  ![Create test](https://github.com/user-attachments/assets/2ab258ac-a62f-4154-8ee6-b8dd095b79c6)
  ![Edit category](https://github.com/user-attachments/assets/22e1be2d-0707-4154-95a1-32fa1a8922c9)
  ![Create category](https://github.com/user-attachments/assets/0644270b-0a94-41b9-abff-ac0eed5eb13c)
  ![User info](https://github.com/user-attachments/assets/087b44b4-71cb-48b7-9ed0-30cc2a414aa1)
</details>

---

## ✨ Features

- 🔐 Authentication & Roles**: Authentication based on nuxt-auth-utils. Creating admin and user rolesю
- **📝 Testing System**: 
  - Full CRUD for tests and questions.
  - Server-side timer for secure test-taking.
  - Level mechanics and experience points (XP).
- **👨‍💻 User Experience**: 
  - Personal dashboard with stats and progress tracking.
  - Responsive design via Tailwind CSS.
  - Form validation with Zod/Yup.
- **🛠 Admin Management**: Comprehensive panel to manage users, test content, and categories.
- **📲 Telegram Integration**: Seamless usage as a Telegram Mini App.

---

## 🛠 Tech Stack

- **Frontend**: Vue 3, Nuxt 4, TypeScript, Pinia, Tailwind CSS.
- **Backend**: Node.js, Nitro, REST API.
- **Database**: PostgreSQL.
- **DevOps**: Docker, VPS Deployment.

---

## 🏗 Architecture

- **Nuxt SSR**: High-performance frontend with Server Side Rendering.
- **Nitro Server**: Light and fast backend API.
- **Middleware**: Protection of routes and user roles.

---

## 🚀 Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/scRelic/it-tests-platform.git](https://github.com/scRelic/it-tests-platform.git)

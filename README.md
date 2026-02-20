# IT Tests Platform 🚀

[cite_start]Full-stack platform for creating and passing IT tests with authentication, role-based access, progress tracking, and an advanced admin panel. [cite: 8, 9, 27]

🌐 **Live Demo:** [it-tests.buzz](https://it-tests.buzz)  
👤 **Demo account:** - **Email:** `demo@test.com`  
- **Password:** `demo123`  

[cite_start]🤖 **Telegram Web App:** [it_tests_relic_bot](https://t.me/it_tests_relic_bot) [cite: 40]

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
</details>

---

## ✨ Features

- [cite_start]**🔐 Authentication & Roles**: JWT-based authentication with role-based access control (RBAC). [cite: 28, 30]
- **📝 Testing System**: 
  - [cite_start]Full CRUD for tests and questions. [cite: 31]
  - [cite_start]Server-side timer for secure test-taking. [cite: 33]
  - [cite_start]Level mechanics and experience points (XP). [cite: 32]
- **👨‍💻 User Experience**: 
  - [cite_start]Personal dashboard with stats and progress tracking. [cite: 32]
  - [cite_start]Responsive design via Tailwind CSS. [cite: 36]
  - [cite_start]Form validation with Zod/Yup. [cite: 37]
- [cite_start]**🛠 Admin Management**: Comprehensive panel to manage users, test content, and categories. [cite: 34]
- [cite_start]**📲 Telegram Integration**: Seamless usage as a Telegram Mini App. [cite: 40]

---

## 🛠 Tech Stack

- [cite_start]**Frontend**: Vue 3, Nuxt 4, TypeScript, Pinia, Tailwind CSS. [cite: 13, 28]
- [cite_start]**Backend**: Node.js, Nitro, REST API. [cite: 14, 28, 30]
- [cite_start]**Database**: PostgreSQL. [cite: 28, 35]
- [cite_start]**DevOps**: Docker, VPS Deployment. [cite: 39]

---

## 🏗 Architecture

- **Nuxt SSR**: High-performance frontend with Server Side Rendering.
- **Nitro Server**: Light and fast backend API.
- **Middleware**: Protection of routes based on JWT and user roles.

---

## 🚀 Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/scRelic/it-tests-platform.git](https://github.com/scRelic/it-tests-platform.git)
   cd it-tests-platform

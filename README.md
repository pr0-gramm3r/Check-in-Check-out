# ⏱️ TimeFlow-AD — Check-in / Check-out Management System

A modern **attendance tracking system** built with Laravel that allows users to manage their daily check-in and check-out activities with a clean dashboard and admin controls.

---

## 🚀 Features

### 👤 User Features

* 🔐 Authentication (Register / Login / Logout)
* 🕒 Check-in & Check-out system
* 📊 View current attendance status
* ⏳ Track working duration

---

### 🛠️ Admin Features

* 📋 View all attendance records
* 👥 Manage users (Delete / Reset Password)
* 📈 Monitor employee activity
* 🔎 Pagination for large datasets

---

## 🧠 Tech Stack

* **Backend:** PHP (Laravel)
* **Frontend:** Blade Templates, HTML, CSS
* **Database:** MySQL
* **Styling:** Custom CSS + Tailwind (partial)

---

## 📁 Project Structure

```id="strc01"
Check-in-Check-out/
│
├── app/                 # Core application logic
├── resources/views/     # Blade templates (UI)
├── public/css/          # Styling files
├── routes/web.php       # Application routes
├── tests/               # Test files
└── README.md            # Project documentation
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash id="cmd01"
git clone https://github.com/pr0-gramm3r/Toaster.git
cd Check-in-Check-out
```

---

### 2. Install dependencies

```bash id="cmd02"
composer install
npm install
```

---

### 3. Configure environment

```bash id="cmd03"
cp .env.example .env
php artisan key:generate
```

Update `.env` file with your database credentials.

---

### 4. Run migrations

```bash id="cmd04"
php artisan migrate
```

---

### 5. Start the server

```bash id="cmd05"
php artisan serve
```

---

## 🔑 Admin Access

Admin access is currently controlled by specific emails:

```id="adm01"
raj@gmail.com
ayush123@gmail.com
```

You can modify this logic inside:

```id="adm02"
resources/views/welcome.blade.php
```

---

## 📸 Screens 

* Login Page
  <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/67c9ba15-f9da-47b4-bdd1-3f4a1a9f21ea" />
* Home
  <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/baa8593e-c4d3-43b2-89d9-9cf0a1e65dfc" />
* Admin Panel
  <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/f92c44ca-23a2-466a-8e92-d459a6d25cf8" />
  <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/0ba99426-d997-42fa-a064-7526e9b45e09" />
* Dashboard
  <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/7bdfa89e-5e40-4013-8f6c-62f3e585082b" />


  

---

## 📌 Key Functionality

### ✔ Check-in / Check-out Logic

* Prevents multiple check-ins
* Tracks session until check-out
* Calculates total working duration

---

### ✔ Attendance Management

* Stores user attendance records
* Displays real-time status
* Supports admin monitoring

---

## ⚠️ Current Limitations

* ❌ No role-based authentication (uses email check)
* ❌ No API support
* ❌ No real-time updates
* ❌ UI can be improved (mobile responsiveness)

---

## 🚀 Future Improvements

* ✅ Implement proper role-based access control
* ✅ Add REST API support
* ✅ Improve UI with modern frameworks (React / Vue)
* ✅ Add charts & analytics dashboard
* ✅ Add notifications system (toast integration 👀)

---

## 💡 Why This Project?

This project demonstrates:

* Full-stack development using Laravel
* Authentication & session management
* Database handling & relationships
* Admin dashboard design

---

## 🧑‍💻 Author

Made with ❤️ by **pr0-gramm3r**

---

## ⭐ Support

If you found this useful:

* ⭐ Star the repo
* 🍴 Fork it
* 💡 Suggest improvements

---

## 📜 License

This project is open-source and available for learning and development.

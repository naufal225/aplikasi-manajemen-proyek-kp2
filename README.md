# Aplikasi Manajemen Proyek KP 2 — Admin Web Panel

![Laravel](https://img.shields.io/badge/framework-Laravel-red)
![React](https://img.shields.io/badge/frontend-React-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Overview

A role-based project management web application designed to streamline internal workflows. This admin panel empowers authorized personnel to manage users, projects, and division structures effectively.

> This web app is part of a **cross-platform project management system**, paired with a mobile application for managers and employees.

🎯 Target users: recruiters, university lecturers, developers, and clients from both academic and industrial sectors.

---

## 👥 User Roles

### ✅ Admin Features:
- Login / Logout
- Dashboard with data overview
- Manage Managers & Employees (CRUD)
- Manage Divisions & Projects (CRUD)
- Assign managers to divisions
- Assign projects to divisions
- Download project reports within a time range

---

## 🛠️ Tech Stack

- **Backend**: Laravel 11
- **Frontend**: React.js + Inertia.js
- **UI Framework**: ShadCN UI
- **Database**: MySQL

---

## ⚙️ Installation (Developer Setup)

### Clone the repository
```bash
git clone https://github.com/naufal225/aplikasi-manajemen-proyek-kp2.git
cd aplikasi-manajemen-proyek-kp2

### Install PHP & JS dependencies
```bash
composer install
npm install

### Create environment file
```bash
cp .env.example .env

### Generate app key
```bash
php artisan key:generate

### Run migrations and seeders
```bash
php artisan migrate --seed

### Start development servers
```bash
php artisan serve
npm run dev

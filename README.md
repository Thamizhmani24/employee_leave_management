# LeaveFlow: Employee Leave Management System

A simple, light-weight, yet modern and complete **Employee Leave Management System** built using **Java Spring Boot**, **React.js (Vite)**, and **MySQL**. 

This project is designed with a decoupled Client-Server architecture and features a premium user interface with interactive dashboards for both employees and managers.

---

## 🚀 Key Features

*   **Role-Based Access Control:** Distinct workflows and interactive dashboards for **Employees** and **Managers** based on their roles.
*   **Employee Leave Requests:** Employees can request leaves (Casual, Sick, Annual, Unpaid, etc.) with custom descriptions and date ranges, calculating totals automatically.
*   **Approval Workflow:** Managers can review pending requests and instantly approve or reject them, updating the database in real time.
*   **Employee CRUD Directory:** Managers can create new employee accounts, update details (Name, Email, Password, Department), and delete employees.
*   **Automated Schema Update:** The application uses Hibernate ORM to automatically generate and synchronize tables in the MySQL database upon startup.
*   **Sleek Modern UI:** Built with custom dark mode theme variables, glassmorphism card designs, subtle hover animations, and fully responsive layouts.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js, Vite, Vanilla CSS3 (Custom Design System, variables & layouts)
*   **Backend:** Java 17, Spring Boot 3.x, Spring Data JPA, Spring Web
*   **Database:** MySQL 8.x
*   **Dependency Management:** Maven (Backend), NPM (Frontend)

---

## 📐 Architecture & Flow

```text
  [ React Frontend (Vite) ]   <--- (JSON APIs / REST) --->   [ Spring Boot Backend ]
                                                                       │
                                                                   (JDBC JPA)
                                                                       ▼
                                                              [ MySQL Database ]

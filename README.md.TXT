- Library Management System
Full-Stack εφαρμογή διαχείρισης βιβλιοθήκης

-Τεχνολογίες & Εργαλεία
- Backend
- **Framework:** Spring Boot 3.x με Java
- **Security:** Spring Security (JWT Authentication)
- **Database:** SQL Server με Spring Data JPA
- **IDE:** IntelliJ IDEA
- **Build Tool:** Maven

- Frontend  
- **Framework:** React 18 με JavaScript
- **Styling:** Bootstrap + Custom CSS
- **IDE:** Visual Studio Code
- **Package Manager:** npm

- Database
- **DBMS:** Microsoft SQL Server
- **Management Tool:** SQL Server Management Studio (SSMS)
- **Tables:** users, books, book_loans

- Demo Credentials
- **Username:** admin
- **Password:** admin123
- **Role:** ADMIN (πλήρη δικαιώματα)

- Setup Instructions

- Backend (IntelliJ IDEA)
1. Import το project ως Maven project
2. Configure database connection στο `application.properties`
3. Run το `LibraryApplication.java`
4. Backend available: http://localhost:8080

- Frontend (VS Code)
1. Open frontend folder στο VS Code
2. Run: `npm install`
3. Run: `npm start`
4. Frontend available: http://localhost:3000

- Database (SQL Server Management Studio)
1. Create database: `library_management`
2. Tables δημιουργούνται αυτόματα από JPA
3. Test data loaded on startup

- Αρχιτεκτονική
- **Backend:** RESTful API με Spring Boot
- **Frontend:** Single Page Application (SPA) με React
- **Database:** Relational database με foreign keys
- **Communication:** HTTP requests με JSON data
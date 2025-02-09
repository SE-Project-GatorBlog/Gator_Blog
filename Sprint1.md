# Sprint 1 Documentation

## Project Name: Gator Blog
**Sprint Duration:**  01/17/2025 -  02/10/2025  
**Team Members:**  
- Durga Sritha Dongla - Front End  
- KJ Pressly - Front End  
- Saranya Yadlapalli - Back End  
- Sai Harshitha Baskar - Back End  

---

## 1. Sprint Goal
The objective of Sprint 1 was to set up the foundational structure of the Gator Blog website, including backend and frontend scaffolding, user authentication, and basic blog post functionality.

---

## 2. User Stories
### Implemented:
1. **As a developer, I want to set up the backend environment and codebase** so that the project is structured properly.
2. **As a user, I want a homepage with essential features** so that I can navigate and explore the blog.
3. **As a user, I want to sign up by providing a username, email, and password** so that I can create an account.
4. **As a user, I want to sign in using my email and password** so that I can access my account securely.
5. **As a user, I want to register through a secure API that stores my credentials safely** so that my personal data remains protected.
6. **As a user, I want to log in through a secure API that validates my credentials and returns a session/token** so that I can stay authenticated.
7. **As a frontend developer, I want to set up the frontend environment and codebase** so that I can build and test UI components efficiently.
8. **As a user, I want a secure and user-friendly signup page** so that I can easily create an account.
9. **As a user, I want a secure and user-friendly login page** so that I can easily access my account.
10. **As a developer, I want to set up a MySQL database connection using GORM** so that I can efficiently manage data.

### Backlog (Not Implemented in Sprint 1):
1. **As a user, I want to comment on blog posts** so that I can engage with authors and other readers.
2. **As a user, I want to like blog posts** so that I can show appreciation for good content.
3. **As an admin, I want to manage users and posts** to maintain content quality and enforce guidelines.

---

## 3. Tasks Completed
### Backend Setup:
- Initialized the project with Go and MySQL.
- Established DB Connection and API routing using Gorm frameworks.
- Set up user authentication using OAuth/Email & Password.
- Implemented REST API endpoints for RegisterUser, LoginUser APIs on blog posts.
- Created database models for Users and Blog Posts.

### Frontend Setup:
- Did the initial setup of the React application and installed required libraries/dependencies.
- Created the MainComponent and set up the routing paths.
- Designed basic UI for user authentication.
- Created components for login and sign-up pages.

### Database:
- Configured MySQL for storing user and blog data.

### Deployment & DevOps:
- Configured a local development environment.
- Set up a version control system (GitHub).

---

## 4. Testing:
- Tested test-API using Postman and validated respective changes in DB.
- Tested CRUD operations in DB by calling APIs through Postman.
- Tested the User Interface by hosting on a localhost server.

---

## 5. Challenges Faced
- Integration issues between frontend and backend APIs.
- User authentication security concerns and OAuth implementation difficulties.
- Database schema adjustments to accommodate additional fields.

---

## 6. Lessons Learned
- Importance of defining clear API contracts early in the sprint.
- Need for detailed documentation to ensure smooth collaboration.
- Using test-driven development (TDD) helped identify issues early.

---

## 7. Sprint Retrospective
### What Went Well:
- Successfully set up project structure and implemented core features.
- Good team collaboration and task distribution.
- Effective use of version control and issue tracking.

### What Could Be Improved:
- More detailed user stories and acceptance criteria.
- Better planning for API integrations to reduce delays.
- Improved time estimation for tasks.

---

## 8. Next Steps
- Implement commenting and liking features.
- Improve UI design and user experience.
- Conduct usability testing and gather user feedback.


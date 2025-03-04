# Sprint 2 Documentation

## Project Name: Gator Blog
**Sprint Duration:**  02/10/2025 -  03/03/2025  

**Team Members:**  
- Durga Sritha Dongla - Front End  
- KJ Pressly - Front End  
- Saranya Yadlapalli - Back End  
- Sai Harshitha Baskar - Back End  

---

## 1. Sprint Goal
The goal of Sprint 2 was to enhance the functionality of the Gator Blog platform by implementing APIs for authenticated users to fetch blog posts and developing a user profile dashboard. Additionally, this sprint focused on improving overall system reliability through rigorous testing. Backend APIs were thoroughly tested using Postman and unit tests with mock databases to ensure consistency, while frontend components underwent testing using Cypress. 

---

## 2. Visual Demo Links

- [Backend](https://drive.google.com/file/d/17cDwjARJE7OVud6uTvol504JOknqurgR/view?usp=share_link)
- [Frontend](https://drive.google.com/file/d/1TGV5FhD9_p_Hwyxsn_xckJ3C5KD6OOxB/view?usp=share_link)
- Link to the Repository: https://github.com/SE-Project-GatorBlog/Gator_Blog/
---

## 3. User Stories

| User Stories | Explanation | Implemented |
|-------------|-------------|--------------|
| As a backend developer, I want to implement an API to fetch blogs for authenticated users | To allow users to view only their relevant content | ✅ |
| As a backend developer, I want to test the functionality of my backend code and APIs | To ensure all implemented features work correctly | ✅ |
| As a backend developer, I want to test the functionality for SignUp | To validate user registration and prevent unauthorized access | ✅ |
| As a backend developer, I want to test the functionality for SignIn | To verify authentication and ensure secure login | ✅ |
| As a frontend developer, I want to test the functionality of my frontend code | To validate UI interactions and user experience | ✅ |
| As a frontend developer, I want to test the Login Page functionality | To ensure users can securely log in without errors | ✅ |
| As a frontend developer, I want to test the SignUp Page functionality | To verify that new users can register successfully | ✅ |
| As a frontend developer, I want to test the Dashboard Page functionality | To confirm dashboard elements load correctly and display user-specific data | ✅ |
| As a frontend developer, I want to test the Home Page functionality | To validate navigation, layout, and featured blog posts | ✅ |
| As a frontend developer, I want to test the Forgot Password Page functionality | To ensure users can reset their passwords securely | ✅ |
| As a user, I want to delete and edit my posted blogs | To manage my content effectively | ✅ |
| As a user, I want to create a profile for my dashboard | To personalize my account and manage settings | ✅ |
| As a user, I want to post blogs so that I can share my thoughts, insights, and updates with others | To contribute content to the platform | ✅ |
| As a user, I want to comment on blog posts | To engage with authors and other readers | ❌ |
| As a user, I want to like blog posts | To show appreciation for good content | ❌ |
| As a user, I want to edit my blog posts after publishing | To correct mistakes or update content | ❌ |

### 3.1 Reasons for Not Implementing Certain Features

- **Commenting on Blog Posts:** This feature was deprioritized in Sprint 1 as the focus was on establishing core authentication and backend setup. It will be implemented in the next sprint.  
- **Liking Blog Posts:** Implementing a like feature requires additional modifications to the database schema and was planned for a future sprint to maintain the sprint timeline.  
- **Editing blog posts after publishing** Editing functionality requires implementing version control and additional backend logic, which were deprioritized for this sprint. 

---

## 4. Tasks Completed
### Backend Setup:
- Implemented API to fetch blogs for authenticated users.
- Performed unit testing for all backend functions, covering all test cases using mock databases to avoid inconsistencies.
- Enhanced database schema to support multiple blog posts.
- Conducted API testing using Postman to verify CRUD operations.

### Frontend Setup:
- Developed UI components for editing and deleting blogs.
- Created the user profile dashboard page with editable fields.
- Implemented unit testing for frontend components using Cypress.
- Created a rich text editor with multiple features for creating, editing, and styling blog posts.
- Developed and successfully implemented a page listing all popular blog posts.

### Database:
- Updated MySQL schema to store user profile details.
- Added constraints and validations to prevent invalid data entry.

### Deployment & DevOps:
- Resolved API connection issues between frontend and backend.
- Updated the code on a version control system (GitHub).

### Figma Designs:
![Homepage Layout](images/Home_Page.png)  
![Signup Page](images/Sign_Up_Page.png)  
![Login Page](images/Login_Page.png)  
![ForgotPassword Page](images/Forgot_Password.png) 

---

## 5. Testing:
- Verified API responses using Postman for all CRUD operations.
- Conducted UI testing for blog post management and user profile authentication using Cypress.
- Validated authentication security for user-specific content access.
- Debugged and resolved inconsistencies in API responses using mock databases.

---

## 6. Challenges Faced
- Database schema adjustments to accommodate additional fields.
- Handling authentication and authorization for blog fetching API.
- Synchronizing frontend state updates with backend changes.
- Resolving merge conflicts due to parallel feature development.

---

## 7. Lessons Learned
- Improved coordination between frontend and backend teams speeds up integration.
- Writing test cases earlier helps catch errors before deployment.
- Using test-driven development (TDD) helped identify issues early.

---

## 8. Sprint Retrospective
### What Went Well:
- Successfully implemented user profile management.
- Improved testing methodologies for both frontend and backend.
- Effective sprint planning and task distribution.
- Effective use of version control and issue tracking.

### What Could Be Improved:
- More comprehensive UI testing with diverse user scenarios.
- Reducing manual testing effort by automating API tests.
- Better planning for API integrations to reduce delays.

---

## 9. Next Steps
- Implement likes and comments functionality.
- Enhance user dashboard with additional profile features.
- Improve search and filtering options for blog posts.


# Sprint 3 Documentation

## Project Name: Gator Blog
**Sprint Duration:**  03/04/2025 -  31/03/2025  

**Team Members:**  
- Durga Sritha Dongla - Front End  
- KJ Pressly - Front End  
- Saranya Yadlapalli - Back End  
- Sai Harshitha Baskar - Back End  

---

## 1. Sprint Goal
The goal of Sprint 3 was to complete core blog functionalities with full CRUD operations, enhance the password reset process via email, and implement frontend profile page integration. This sprint focused on robust testing and seamless integration between frontend and backend systems. 

---

## 2. Visual Demo Links

- [Frontend Part 1](https://drive.google.com/file/d/17cDwjARJE7OVud6uTvol504JOknqurgR/view?usp=share_link)
- [Frontend Part 2](https://drive.google.com/file/d/1f2F7-4MtmcWuADgPmJbWR4LDt2_Xa_a7/view?usp=share_link)
- [Backend](https://drive.google.com/file/d/1TGV5FhD9_p_Hwyxsn_xckJ3C5KD6OOxB/view?usp=share_link)
- Link to the Repository: https://github.com/SE-Project-GatorBlog/Gator_Blog/
---

## 3. User Stories

| User Stories | Explanation | Implemented |
|-------------|-------------|--------------|
| As a user, I want to be able to delete my posted blogs | To allow users to manage and remove their own content | ✅ |
| As a user, I want to be able to post blogs so that I can share my thoughts, insights, and updates with others | To enable content creation and sharing | ✅ |
| As a user, I want to create a profile for my user dashboard | To personalize the user experience and enable profile management | ✅ |
| As a Developer, I want to validate email utility using standalone testing to ensure email delivery | To ensure that emails are properly sent during password reset | ✅ |
| As a Developer, I want to test the complete forgot password flow from email to reset | To validate end-to-end functionality of the password reset feature | ✅ |
| As a Backend Developer, I want to test the Reset Password API to confirm secure password update | To ensure password updates are secure and functioning | ✅ |
| As a Backend Developer, I want to test the Verify Reset Code API for valid and expired codes | To validate proper behavior for reset code verification | ✅ |
| As a Backend Developer, I want to test the Request Reset Code API to ensure it sends emails correctly | To confirm reset code emails are being sent successfully | ✅ |
| As a Backend Developer, I want to configure the email utility to send password reset codes using Gmail SMTP | To implement actual email delivery for password reset | ✅ |
| As a Backend Developer, I want to test create, update, view and delete the posts | To ensure all blog CRUD operations function properly | ✅ |
| As a Backend Developer, I want to implement the Reset Password API to securely update the user's password after verification | To complete the forgot password flow securely | ✅ |
| As a Backend Developer, I want to create, update, view and delete the posts | To implement complete blog management features | ✅ |
| As a Backend Developer, I want to implement the Verify Reset Code API to check the validity of the entered code | To verify reset code before allowing password change | ✅ |
| As a Backend Developer, I want to implement the Request Reset Code API to send a verification code to the user's email | To start the password reset process securely | ✅ |
| As a user, I want to be able to like blog posts | To engage with content and show appreciation | ❌ |
| As a user, I want to comment on blog posts | To interact with blog authors and other readers | ❌ |
| As a frontend developer, I want to implement blog search and filter by category | To improve content discoverability | ❌ |

### 3.1 Reasons for Not Implementing Certain Features

- **Commenting on Blog Posts:** This feature was deprioritized in Sprint 1 as the focus was on establishing core authentication and backend setup. It will be implemented in the next sprint.  
- **Liking Blog Posts:** Implementing a like feature requires additional modifications to the database schema and was planned for a future sprint to maintain the sprint timeline.  
- **Search and Filter Functionality:** This feature was postponed due to prioritization of core profile and CRUD functionalities. It involves additional frontend logic and API query handling which will be taken up in the next sprint.

---

## 4. Tasks Completed
### Backend Setup:
- Implemented the complete Forgot Password flow using three secure APIs: 
  - `POST /request-reset-code` to send a reset code via email, 
  - `POST /verify-reset-code` to validate the reset code, and 
  - `POST /reset-password` to allow users to securely reset their passwords.  
  These APIs include validations, email utility integration, and error handling for robust user support.

- Developed full CRUD (Create, Read, Update, Delete) functionality for blogs through RESTful APIs, allowing   authenticated users to manage their content effectively:
  - `GET /blogs` - Retrieve blogs belonging to the logged-in user
  - `POST /blogs` - Create a new blog post
  - `PUT /blogs/:id` - Update an existing blog
  - `DELETE /blogs/:id` - Remove a blog post

- Enhanced database schema to support password reset flow and blog metadata tracking by introducing new fields in the `users` and `blogs` tables. This included fields for storing reset codes, code expiry timestamps, and automatic tracking of blog creation and update times.

- Performed extensive unit testing using mock databases to simulate real scenarios. Covered edge cases, error responses, and user-specific validations for all new APIs to ensure system reliability and correctness.
  
### Frontend Setup:
- Designed and implemented the User Profile page, including editable fields to display and update user information, all fully integrated with backend APIs.
  
- Integrated all newly developed blog CRUD API within the frontend, ensuring users can create, update, delete, and view their own blogs seamlessly via intuitive UI interactions.
  
- Wrote Cypress end-to-end (E2E) tests to simulate real user behavior for all profile and blog operations, ensuring consistent frontend-backend interaction.
  
- Implemented unit tests for key frontend components using React Testing Library to ensure UI rendering and logic correctness.


### Database:
- Updated MySQL schema to store user profile details.
- Added constraints and validations to prevent invalid data entry.
  
- Modified the `users` table by adding two new fields:
  - `reset_code` – stores the one-time code sent for password reset
  - `reset_code_expiry` – timestamp indicating the expiration of the reset code  
  These fields enable secure handling of the forgot password feature.

- Updated the `blogs` table to include:
  - `created_at` and `updated_at` timestamps  
  This helps in tracking blog creation and modification history for improved sorting, filtering, and version control.

### Deployment & DevOps:
- Resolved API connection issues between frontend and backend.
- Updated the code on a version control system (GitHub).

---


# API Documentation

## Blog APIs (JWT Protected)

### 1. Get Blog List  
**Endpoint:** GET /api/blogs  
**Description:** Fetches all blogs for the authenticated user.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK** (Success)
```json
{
  "statusText": "OK",
  "msg": "Blog List",
  "blogs": [
    {
      "id": 1,
      "title": "My First Blog",
      "post": "This is my first blog content...",
      "user_id": 123
    }
  ]
}
```

- **401 Unauthorized** (Missing/invalid token)
```json
{
  "statusText": "error",
  "msg": "Unauthorized"
}
```

---

### 2. Create Blog  
**Endpoint:** POST /api/blogs  
**Description:** Creates a new blog post for the authenticated user.  
**Headers:**  
`Authorization: Bearer <jwt_token>`  
**Request Body:**
```json
{
  "title": "New Blog Title",
  "post": "This is the content of the new blog."
}
```

**Response:**
- **201 Created**
```json
{
  "statusText": "OK",
  "msg": "Blog created successfully",
  "blog": {
    "id": 2,
    "title": "New Blog Title",
    "post": "This is the content of the new blog.",
    "user_id": 123
  }
}
```

---

### 3. Update Blog  
**Endpoint:** PUT /api/blogs/:id  
**Description:** Updates an existing blog post.  
**Headers:**  
`Authorization: Bearer <jwt_token>`  
**Request Body:**
```json
{
  "title": "Updated Blog Title",
  "post": "Updated content for the blog."
}
```

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Blog updated successfully",
  "blog": {
    "id": 2,
    "title": "Updated Blog Title",
    "post": "Updated content for the blog.",
    "user_id": 123
  }
}
```

---

### 4. Delete Blog  
**Endpoint:** DELETE /api/blogs/:id  
**Description:** Deletes a blog post.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Blog deleted successfully"
}
```

---

## Forgot Password APIs

### 5. Request Reset Code  
**Endpoint:** POST /api/request-reset-code  
**Description:** Sends a reset code to the user's email address.  
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Reset code sent successfully"
}
```

---

### 6. Verify Reset Code  
**Endpoint:** POST /api/verify-reset-code  
**Description:** Verifies the reset code submitted by the user.  
**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Reset code verified successfully"
}
```

- **400 Bad Request**
```json
{
  "statusText": "error",
  "msg": "Invalid or expired code"
}
```

---

### 7. Reset Password  
**Endpoint:** POST /api/reset-password  
**Description:** Resets the user's password after code verification.  
**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "new_password": "newsecurepassword"
}
```

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Password reset successful"
}
```
---

## 5. Testing:
- Verified API responses using Postman for all CRUD operations.
- Conducted UI testing for blog post management and user profile authentication using Cypress.
- Validated authentication security for user-specific content access.
- Debugged and resolved inconsistencies in API responses using mock databases.
  
### 5.1 Backend Testing:
#### Blog_test:
The unit tests in blog_test.go focus on testing the Blog API functionality, ensuring that various scenarios related to fetching blog posts work correctly.

#### Test Setup:
- Uses an **in-memory SQLite database** to simulate a real database environment for testing.
- Initializes test data, including a sample user and blog posts.
- Implements middleware to set user authentication context.

#### Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestBlogListUnauthorized** | Ensures that an unauthenticated user gets an error when trying to fetch blogs. |
| **TestBlogListEmpty** | Checks that a user with no blog posts gets an empty list response. |
| **TestBlogListWithBlogs** | Verifies that a user with multiple blogs receives a list of their own blogs. |
| **TestBlogListUserNotFound** | Ensures an error response if the requested user does not exist. |
| **TestBlogListDatabaseError** | Simulates a database failure and checks if the API handles it gracefully. |
| **TestBlogListUserSegregation** | Validates that users only see their own blogs and not other users' posts. |

These tests ensure that the blog fetching functionality works correctly under different conditions, covering authentication, database integrity, and error handling.

#### Users_test:
The unit tests in users_test.go focus on testing the authentication functionality of the Gator Blog platform, ensuring that user registration (SignUp) and authentication (SignIn) work correctly under various conditions.

#### Test Setup:
- Uses an **in-memory SQLite database** to simulate a real database environment for testing.
- Initializes the database with user data for authentication tests.
- Configures API routes for signup and login.

#### Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestSignUpSuccess** | Ensures that a new user can successfully register and receive a valid token. |
| **TestSignUpDuplicateEmail** | Validates that users cannot register with an email that is already taken. |
| **TestSignUpDuplicateUsername** | Ensures that duplicate usernames are not allowed during registration. |
| **TestSignUpInvalidJSON** | Tests handling of malformed JSON requests during signup. |
| **TestSignInSuccess** | Verifies that an existing user can successfully log in and receive a token. |
| **TestSignInUserNotFound** | Ensures an error response when a non-existent user attempts to log in. |
| **TestSignInIncorrectPassword** | Validates that incorrect passwords return an authentication error. |
| **TestSignInInvalidJSON** | Checks if the API properly handles malformed JSON requests during login. |
| **TestSignInMissingFields** | Ensures that missing fields in login requests result in an appropriate error response. |
| **TestJWTTokenValidation** | Validates the JWT authentication process, ensuring tokens are correctly generated and verified. |
| **TestMalformedContentType** | Ensures that requests with incorrect content types are properly handled. |
| **TestDatabaseErrorHandling** | Simulates database errors to test how the API handles failures during authentication. |

These tests ensure the robustness of authentication mechanisms, preventing issues like duplicate accounts, incorrect logins, and handling edge cases efficiently.
___

### 5.2 Frontend Testing:
#### Using Cypress testing:
The Cypress tests in spec.cy.js focus on testing the frontend functionality of the Gator Blog platform, ensuring that key user interface elements and authentication flows work correctly.

#### Test Setup:
- Uses **Cypress** for end-to-end testing of the frontend components.
- Simulates user interactions such as form submissions, navigation, and authentication.
- Validates UI behavior and API integration.

#### Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestLoginPage** | Ensures the login page loads correctly and allows users to sign in successfully. |
| **TestSignUpPage** | Verifies that users can register successfully and validation errors are displayed for incorrect inputs. |
| **TestDashboardPage** | Confirms that the dashboard loads correctly and displays user-specific content. |
| **TestHomePage** | Validates that the homepage loads properly and blog posts are listed as expected. |
| **TestForgotPasswordPage** | Ensures users can reset their passwords and receive a confirmation message. |
| **TestCreateBlogPost** | Tests the ability to create a new blog post and validate input fields. |
| **TestEditBlogPost** | Ensures that users can edit their blog posts and see updated content. |
| **TestDeleteBlogPost** | Verifies that users can delete their blog posts and receive confirmation. |
| **TestNavigation** | Checks that the navigation bar functions correctly, allowing users to move between pages. |
| **TestLogout** | Ensures that users can log out and are redirected to the login page. |

These tests ensure the frontend UI functions smoothly, validating both user interactions and API responses.

#### Frontend Unit Tests:
The frontend unit tests focus on verifying the rendering of key UI components in the Gator Blog platform using **React Testing Library**. These tests ensure that essential buttons, images, and navigation elements are present on the homepage.

#### Test Setup:
- Uses React Testing Library for unit testing.
- Wraps components in MemoryRouter to simulate routing behavior.
- Verifies rendering of UI elements based on user expectations.

#### Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestStartBloggingButton** | Ensures the "START BLOGGING" button is rendered on the homepage. |
| **TestHomeButton** | Verifies that the "HOME" button is present in the UI. |
| **TestMyProfileButton** | Confirms that the "MY PROFILE" button is correctly displayed. |
| **TestGatorImage** | Ensures that the Gator image is rendered properly. |
| **TestPostsButton** | Checks that the "POSTS" button appears in the interface. |

These tests help maintain UI consistency by ensuring critical elements are correctly displayed and accessible to users.

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
- Implement creating and updating blog posts

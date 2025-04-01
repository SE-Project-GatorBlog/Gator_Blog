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
### 5.1 Backend Testing:

#### Blog_test:
In addition to blog listing, Sprint 3 added full unit test coverage for all CRUD operations and blog fetching. Redis caching integration was also validated through clean state setup between tests.

#### New Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestBlogCreateSuccess** | Ensures a blog post can be created successfully with proper data and timestamps. |
| **TestBlogCreateUnauthorized** | Verifies that users without authentication cannot create blogs. |
| **TestBlogCreateInvalidInput** | Validates server response to malformed or incomplete input. |
| **TestBlogCreateUserNotFound** | Ensures blog creation fails if the user context is missing in DB. |
| **TestBlogUpdateSuccess** | Tests that users can update blog content and timestamps correctly. |
| **TestBlogUpdateNonExistent** | Ensures update request to non-existent blog returns correct error. |
| **TestBlogUpdateInvalidInput** | Validates behavior for malformed JSON during update. |
| **TestBlogUpdateOtherUserBlog** | Ensures one user cannot update another user’s blog. |
| **TestBlogDeleteSuccess** | Confirms that blogs can be deleted and are removed from DB. |
| **TestBlogDeleteNonExistent** | Ensures deletion of non-existent blog returns appropriate error. |
| **TestBlogDeleteOtherUserBlog** | Verifies that users cannot delete blogs owned by others. |
| **TestBlogDeleteUnauthorized** | Ensures unauthorized users cannot delete blogs. |
| **TestBlogFetchSuccess** | Tests successful retrieval of a specific blog post. |
| **TestBlogFetchUnauthorized** | Ensures unauthenticated requests cannot access individual blogs. |
| **TestBlogFetchNonExistent** | Confirms correct error is returned for non-existent blog ID. |
| **TestBlogFetchOtherUserBlog** | Validates that users cannot fetch blogs owned by others. |
| **TestBlogFetchUserNotFound** | Ensures error handling when blog's owner doesn't exist. |
| **TestBlogFetchMissingIDParam** | Tests error message when blog ID is not provided in request. |
| **TestBlogListWithTitleFilter** | Tests blog list filtering using partial title match. |

These cases validate edge conditions and access control thoroughly. Redis was reset between each test to validate caching isolation.

---

#### Users_test:
Sprint 3 extended test coverage in `users_test.go` to validate the forgot password flow using reset code requests, verification, and secure password updates.

#### New Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestRequestResetCodeUserNotFound** | Ensures that password reset requests fail for unregistered users. |
| **TestRequestResetCodeInvalidJSON** | Verifies that invalid JSON bodies are rejected appropriately. |
| **TestVerifyResetCodeSuccess** | Tests full verification of a valid code and code removal after success. |
| **TestVerifyResetCodeInvalid** | Checks behavior when an incorrect reset code is provided. |
| **TestVerifyResetCodeExpired** | Simulates expired codes and ensures they are rejected. |
| **TestVerifyResetCodeUserNotFound** | Ensures invalid email leads to proper error in verification. |
| **TestVerifyResetCodeInvalidJSON** | Verifies error response on malformed input for code verification. |
| **TestResetPasswordSuccess** | Ensures that user password can be securely reset. |
| **TestResetPasswordUserNotFound** | Ensures reset fails for unregistered users. |
| **TestResetPasswordInvalidJSON** | Validates server response to malformed JSON. |
| **TestResetPasswordFlow** | Simulates end-to-end password reset: request → verify → reset → login with new password. |

These tests ensure secure handling of reset flows, edge cases, and email-based verification.
All tests were performed using in-memory SQLite DB and isolated app instances. Redis was used to test caching behavior clean-up during blog retrieval scenarios.
___

### 5.2 Frontend Testing:

#### Using Cypress Testing:
Sprint 3 introduced additional **Cypress** tests targeting the Profile Page and new interactions introduced during CRUD and forgot password flow enhancements.

#### Test Setup:
- Continues to use Cypress for end-to-end frontend testing.
- Tests simulate profile management, navigation, and backend API integration.
- Mocks API responses where applicable to simulate network latency and user scenarios.

#### New Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestProfilePageRender** | Confirms the profile page loads correctly and user information is pre-filled. |
| **TestProfileEditAndSave** | Validates that users can edit and save their profile, and the changes reflect properly. |
| **TestUnauthorizedProfileAccess** | Ensures users not logged in are redirected to the login page from the profile route. |

These additions expand test coverage to account for new features in the profile page and routing logic tied to user authentication state.

---

#### Frontend Unit Tests:
In Sprint 3, **Jest** was introduced for unit testing new components and logic in the **Profile Page**.

#### Test Setup:
- Uses **React Testing Library** and **Jest**.
- Profile components are wrapped in routing and context providers for accurate state simulation.
- API methods are mocked to test both UI and logic paths independently.

#### New Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestProfileInputFieldsRender** | Verifies input elements for name, email, and bio appear with correct values. |
| **TestProfileUpdateHandler** | Ensures that saving profile changes triggers the appropriate API call. |
| **TestValidationErrors** | Checks for client-side form validation errors and corresponding UI feedback. |

These tests ensure new frontend functionality is thoroughly tested and error-resistant under different interaction flows.

---

## 6. Challenges Faced
- Database schema adjustments to accommodate additional fields.
- Ensuring secure handling of password reset flow and token expiration.
- Coordinating JWT-based route protections across new endpoints.
- Managing sync between frontend state and backend updates.
- Resolving merge conflicts due to parallel feature development.

---

## 7. Lessons Learned
- Email-based verification adds layers of complexity requiring better error handling.
- Testing APIs early helped catch and fix issues faster.
- Keeping consistent naming and response formats improves frontend integration.
- Improved coordination between frontend and backend teams speeds up integration.
- Writing test cases earlier helps catch errors before deployment.

---

## 8. Sprint Retrospective
### What Went Well:
- Successfully completed full CRUD backend for blogs.
- Robust password reset flow implemented securely.
- Profile page well integrated with backend.
- Effective use of version control and issue tracking.

### What Could Be Improved:
- Automate email testing using local SMTP mocking.
- Add blog filtering/sorting on frontend for better UX.
- More comprehensive UI testing with diverse user scenarios.
- Reducing manual testing effort by automating API tests.

---

## 9. Next Steps
- Implement likes and comments functionality.
- Enhance user dashboard with additional profile features.
- Improve search and filtering options for blog posts.
- Add image upload support in blog posts.

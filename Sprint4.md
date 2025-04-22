# Sprint 4 Documentation

## Project Name: Gator Blog
**Sprint Duration:**  31/03/2025 -  21/04/2025  

**Team Members:**  
- Durga Sritha Dongla - Front End  
- KJ Pressly - Front End  
- Saranya Yadlapalli - Back End  
- Sai Harshitha Baskar - Back End  

---

## 1. Sprint Goal
The goal of Sprint 4 was to finalize the Gator Blog platform by implementing interactive user engagement features like comments and likes, enhancing API endpoints to support blog metadata, and polishing the frontend UI. We also focused on retrieving top popular blogs based on user interactions and completing full-stack integration with robust testing.

---

## 2. Visual Demo Links

- [Backend Sprint 4](https://www.youtube.com/watch?v=HepnACzQ-Rc)
- [Frontend Sprint 4](https://drive.google.com/drive/folders/1W1WqkUVBYRwuj9ZRESUNPuNTbkZoIFwT?usp=share_link)
- [Backend Overall Functionality Demo](https://youtu.be/WmV632xDohA)
- [Frontend Overall Functionality Demo](https://drive.google.com/drive/folders/1W1WqkUVBYRwuj9ZRESUNPuNTbkZoIFwT?usp=share_link)
- Link to the Repository: https://github.com/SE-Project-GatorBlog/Gator_Blog/

---

## 3. User Stories
| User Stories | Explanation | Implemented |
|--------------|-------------|-------------|
| As a user, I want to like blog posts | To express appreciation for valuable content | ✅ |
| As a user, I want to comment on blog posts | To engage in discussions and provide feedback | ✅ |
| As a user, I want to view the top 5 popular blogs | To explore the most liked content | ✅ |
| As a user, I want to view blogs with metadata such as comments and likes | So I get a richer view of the blog's engagement | ✅ |
| As a user, I want to see all blogs posted by a particular user | So I can explore their content from their profile page | ✅ |
| As a backend developer, I want to implement API endpoints for likes and comments | So the frontend can enable user engagement features | ✅ |
| As a backend developer, I want to develop metadata endpoints to return blog details with likes and comments | So the frontend can display engagement stats | ✅ |
| As a backend developer, I want to implement logic to fetch the top 5 most liked blogs | So we can support content discovery | ✅ |
| As a backend developer, I want to write unit tests for all new endpoints | To ensure that they function reliably under all conditions | ✅ |
| As a frontend developer, I want to display blog engagement metadata (likes, comments) | So users can interact with blogs more meaningfully | ✅ |
| As a frontend developer, I want to allow liking and commenting on blogs via UI | So users can actively participate | ✅ |
| As a frontend developer, I want to write Cypress tests for interactive blog features | To ensure frontend behavior is reliable | ✅ |
| As a frontend developer, I want to unit test like and comment components | To maintain UI consistency and correctness | ✅ |

---

## 4. Tasks Completed
### Backend:
- **Implemented Likes and Comments Functionality:**
  - Added support for users to interact with blog posts through likes and comments.
  - Developed two APIs each:
    - `POST /blogs/:id/comments`: Add a comment to a blog post.
    - `GET /blogs/:id/comments`: Retrieve all comments for a blog.
    - `POST /blogs/:id/likes`: Register a like on a blog post.
    - `GET /blogs/:id/likes`: Retrieve all likes for a blog post.
  - Built proper association logic in the backend to ensure comments and likes are linked with users and blog posts.

- **Created Enhanced Data Retrieval Endpoints:**
  - `GET /blogs-with-meta`: Returns blogs with embedded metadata including like count and comments.
  - `GET /top-popular-blogs`: Fetches the top 5 blogs based on the number of likes.
  - `GET /all-blogs-with-meta`: Returns all blogs along with associated likes and comments.
  - These endpoints help power dashboards and analytics components.

- **Testing:**
  - Wrote extensive unit tests using mock databases to cover:
    - Posting and retrieving comments.
    - Posting and retrieving likes.
    - Metadata retrieval, edge cases, and invalid inputs.
  - Validated all new features against security and data consistency checks.

- **Database Logic Integration:**
  - Connected new `likes` and `comments` models with users and blogs.
  - Ensured transactional integrity during creation and deletion processes to prevent orphan records.

### Frontend:
- **Comments and Likes Integration:**
  - Designed interactive components to allow users to:
    - Add comments via input fields on blog detail pages.
    - Like/unlike blog posts with toggle-able UI elements.
  - Rendered metadata (like count, comment count) on blog cards and detailed views.

- **UI Enhancements and Final Integration:**
  - Refined styling, responsiveness, and user flow across pages.
  - Ensured real-time updates on blog interaction (e.g., incrementing like count without refresh).
  - Handled edge cases like duplicate likes and empty comment submissions with appropriate feedback.

- **Testing:**
  - Used Cypress to write full end-to-end tests for:
    - Commenting on blogs.
    - Liking/unliking blogs.
    - Verifying data updates visually in the UI.
  - Added Jest unit tests for:
    - UI components for likes/comments.
    - Functions handling API communication and state updates.

### Database:
- **New Tables Created:**
  - `likes` table:
    - Fields: `id`, `blog_id`, `user_id`, `created_at`
    - Constraints: one like per user per blog (unique constraint).
  - `comments` table:
    - Fields: `id`, `blog_id`, `user_id`, `content`, `created_at`
    - Supports multiple comments per user per blog with full timestamp history.
  
- **Schema Integrations:**
  - Established foreign key relationships with `blogs` and `users`.
  - Applied indexing and query optimization for fast lookups (especially for `top-popular-blogs`).
  - Ensured schema supports efficient joins and aggregations for metadata APIs.


### Deployment & DevOps:
- Resolved API connection issues between frontend and backend.
- Updated the code on a version control system (GitHub).

---

# API Documentation

## Engagement & Metadata APIs (JWT Protected)

### 1. Add Comment to Blog  
**Endpoint:** POST /api/blogs/:id/comments  
**Description:** Adds a comment to the specified blog post.  
**Headers:**  
`Authorization: Bearer <jwt_token>`  
**Request Body:**
```json
{
  "comment": "Great blog post!"
}
```

**Response:**
- **201 Created**
```json
{
  "statusText": "OK",
  "msg": "Comment added successfully"
}
```

---

### 2. Get Comments by Blog ID  
**Endpoint:** GET /api/blogs/:id/comments  
**Description:** Retrieves all comments for a specific blog post.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Comments fetched successfully",
  "comments": [
    {
      "id": 1,
      "user_id": 101,
      "blog_id": 5,
      "comment": "Nice post!",
      "created_at": "2025-04-21T10:00:00Z"
    }
  ]
}
```

---

### 3. Like a Blog  
**Endpoint:** POST /api/blogs/:id/likes  
**Description:** Registers a like from the authenticated user for the specified blog post.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Blog liked successfully"
}
```

---

### 4. Get Likes by Blog ID  
**Endpoint:** GET /api/blogs/:id/likes  
**Description:** Retrieves the number of likes for a specific blog post.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Likes fetched successfully",
  "like_count": 24
}
```

---

### 5. Get Blogs with Metadata  
**Endpoint:** GET /api/blogs-with-meta  
**Description:** Fetches blogs with associated metadata like likes and comments.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Blogs with metadata",
  "blogs": [
    {
      "id": 1,
      "title": "Meta Blog",
      "likes": 12,
      "comments": 4
    }
  ]
}
```

---

### 6. Get Top 5 Popular Blogs  
**Endpoint:** GET /api/top-popular-blogs  
**Description:** Fetches the top 5 blogs with the most likes.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "Top 5 blogs fetched",
  "blogs": [
    {
      "id": 10,
      "title": "Trending Blog",
      "like_count": 120
    }
  ]
}
```

---

### 7. Get All Blogs with Metadata  
**Endpoint:** GET /api/all-blogs-with-meta  
**Description:** Retrieves all blogs including metadata for likes and comments.  
**Headers:**  
`Authorization: Bearer <jwt_token>`

**Response:**
- **200 OK**
```json
{
  "statusText": "OK",
  "msg": "All blogs with metadata",
  "blogs": [
    {
      "id": 2,
      "title": "Deep Dive",
      "likes": 33,
      "comments": 5
    }
  ]
}
```
---

### 5.1 Backend Testing:

#### comment_test:
Sprint 4 introduced extensive test coverage for the comment feature, validating both the posting and retrieval of comments associated with blog posts.

#### New Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **TestAddCommentSuccess** | Ensures a valid comment is successfully posted to a blog. |
| **TestAddCommentInvalidInput** | Checks that malformed JSON results in a 400 Bad Request. |
| **TestAddCommentMissingFields** | Verifies behavior when required fields are missing; validates fallback behavior. |
| **TestGetCommentsByBlogIDWithComments** | Confirms correct retrieval of all comments for a blog with existing data. |
| **TestGetCommentsByBlogIDNoComments** | Ensures an empty list is returned when no comments exist. |
| **TestGetCommentsByNonExistentBlogID** | Confirms graceful handling of requests for blogs that don’t exist. |

These tests verify the robustness of the comments feature, including validation, persistence, and query accuracy.

---

#### like_test:
Sprint 4 also added a suite of tests to validate like functionality, covering both expected behavior and edge cases such as duplicates and invalid references.

#### New Test Cases:

| **Test Case** | **Description** |
|--------------|----------------|
| **Successfully like a blog** | Validates that a blog can be liked by a user successfully. |
| **Try to like blog that doesn't exist** | Confirms that liking a non-existent blog returns 404 Not Found. |
| **Try to like a blog twice** | Ensures duplicate likes by the same user are prevented. |
| **Get likes count for blog with no likes** | Confirms that 0 is returned for blogs with no likes. |
| **Get likes count for blog with likes** | Validates that the correct number of likes is returned. |
| **Get likes for non-existent blog** | Confirms no error and returns 0 likes when the blog ID doesn’t exist. |
| **User not found test** | Tests behavior when the user email is not found in the system. |

These cases ensure the correctness, security, and idempotency of the like mechanism.

---

All tests were executed using an in-memory SQLite database to ensure isolation and repeatability. The mock user authentication context and blog setup allowed validation of both typical and edge-case behaviors.


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
- Designing and integrating a scalable schema for the new `likes` and `comments` tables without affecting existing blog functionality.
- Ensuring idempotent handling of likes to prevent duplicate entries.
- Managing comment validation and error handling for malformed or incomplete submissions.
- Testing new endpoints involving relational data with isolated in-memory databases.
- Maintaining consistent authorization flow using JWT middleware across new APIs.
- Synchronizing frontend UI states (likes/comments) with real-time backend responses.
- Handling UI complexity for nested comment lists and like toggling.
- Fine-tuning queries for fetching top blogs and blog metadata efficiently.

---

## 7. Lessons Learned
- Validating and structuring user interaction data (likes/comments) requires clear backend rules to avoid duplication or invalid entries.
- Writing unit tests alongside API development helped maintain high reliability and catch edge-case bugs early.
- Coordinated API structure and naming across backend and frontend improved integration speed.
- UI logic for interactive components is easier to manage when tied directly to backend response state.
- Modularizing tests and using a clear setup pattern for in-memory SQLite databases made testing faster and more maintainable.
- Real-time metadata (likes/comments) should be handled cautiously to avoid race conditions in concurrent environments.

---

## 8. Sprint Retrospective

### What Went Well:
- Successfully implemented comments and likes with clean API design and robust validation.
- Metadata APIs and top blog fetching worked efficiently and were well-integrated into the frontend.
- UI responsiveness improved significantly with real-time updates for likes/comments.
- Unit and E2E test coverage increased, helping catch bugs early.
- Frontend and backend teams worked in close coordination for final integration.

### What Could Be Improved:
- Refactor comment and like logic for better reusability in future features like notifications.
- Automate API contract validation between frontend and backend.
- Improve test coverage for edge cases involving simultaneous like/comment operations.
- Refine error messages for better frontend display.
- Enhance performance of metadata aggregation queries for large-scale datasets.

---

## 9. Next Steps
- Implement user notifications for likes and replies.
- Enhance user dashboard with additional profile features.
- Improve search and filtering options for blog posts.
- Optimizate Cache Key and Implement fallback mechanism for Cache Failures.
- Explore real-time updates using WebSocket or polling for likes/comments.


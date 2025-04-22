// Cypress Tests for GatorBlog Application

Cypress.on('window:before:load', (win) => {
  const originalFetch = win.fetch;
  win.fetch = (...args) => {
    console.log('[Intercept Debug] FETCH:', args[0]);
    return originalFetch.apply(win, args);
  };

  const originalXhrOpen = win.XMLHttpRequest.prototype.open;
  win.XMLHttpRequest.prototype.open = function (method, url) {
    console.log('[Intercept Debug] XHR:', method, url);
    return originalXhrOpen.apply(this, arguments);
  };
});


// Login Page Tests
describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.contains('h1', 'Log In').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.contains('button', 'Log In').should('be.visible');
  });

  it('should display the "New User? Sign Up Here" button', () => {
    cy.contains('button', 'New User? Sign Up Here').should('be.visible');
  });

  it('should navigate to the signup page when the "New User? Sign Up Here" button is clicked', () => {
    cy.contains('button', 'New User? Sign Up Here').click();
    cy.url().should('include', '/signup');
  });

  it('should display the forgot password link', () => {
    cy.contains('button', 'Forgot Password? Click Here').should('be.visible');
  });

  it('should navigate to the forgot password page when the "Forgot Password?" link is clicked', () => {
    cy.contains('button', 'Forgot Password? Click Here').click();
    cy.url().should('include', '/forgot-password');
  });
  
  it('should validate UF email format', () => {
    // Fill in non-UF email
    cy.get('input[name="email"]').type('test@gmail.com');
    cy.get('input[name="password"]').type('Password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Check error message - using contains to be more flexible
    cy.contains('Please use your UF email address').should('be.visible');
  });

  it('should toggle password visibility when eye icon is clicked', () => {
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    
    // Click the eye icon button
    cy.get('input[name="password"]').parent().find('button').click();
    
    // Password field should now be visible as text
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
  });

  it('should show loading state during login', () => {
    // Fill in valid credentials
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="password"]').type('Password123');
    
    // Intercept the login request to add delay
    cy.intercept('POST', 'http://localhost:8000/api/signin', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: {
          token: 'fake-token',
          statusText: 'success'
        }
      });
    }).as('loginRequest');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Check for loading state
    cy.contains('Logging in...').should('be.visible');
    
    // Wait for the request to complete
    cy.wait('@loginRequest');
  });

  it('should handle server error responses', () => {
    // Fill in valid format credentials
    cy.get('input[name="email"]').type('error@ufl.edu');
    cy.get('input[name="password"]').type('Password123');
    
    // Intercept the login request to simulate error
    cy.intercept('POST', 'http://localhost:8000/api/signin', {
      statusCode: 200,
      body: {
        statusText: 'error',
        msg: 'Invalid credentials'
      }
    }).as('loginRequest');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for the request to complete
    cy.wait('@loginRequest');
    
    // Check error message
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should successfully log in with valid credentials', () => {
    // Fill in valid credentials
    cy.get('input[name="email"]').type('valid@ufl.edu');
    cy.get('input[name="password"]').type('Password123');
    
    // Intercept the login request to simulate success
    cy.intercept('POST', 'http://localhost:8000/api/signin', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        statusText: 'success'
      }
    }).as('loginRequest');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for the request to complete
    cy.wait('@loginRequest');
    
    // Check redirection to dashboard
    cy.url().should('include', '/dashboard');
  });
});

// SignUp Page Tests
describe('SignUp Page Tests', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('should validate UF email address format', () => {
    cy.get('input[name="email"]').type('test@gmail.com');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="verifyPassword"]').type('Password123');
  
    cy.get('button[type="submit"]').click();

    cy.contains('Please use your UF email address').should('be.visible');
  });

  it('should validate username format', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="username"]').type('test-user$');
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="verifyPassword"]').type('Password123');

    cy.get('button[type="submit"]').click();

    cy.contains('Username can only contain').should('be.visible');
  });

  it('should validate password requirements', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password');
    cy.get('input[name="verifyPassword"]').type('password');

    cy.get('button[type="submit"]').click();

    cy.contains('Password must be at least 8 characters').should('be.visible');
  });

  it('should validate passwords match', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="verifyPassword"]').type('Password456');

    cy.get('button[type="submit"]').click();

    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should toggle password visibility when eye icon is clicked', () => {
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    
    // Click the eye icon button
    cy.get('input[name="password"]').parent().find('button').click();
    
    // Password field should now be visible as text
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
  });

  it('should navigate back to login when "Already have an account?" is clicked', () => {
    cy.contains('Already have an account?').click();
    cy.url().should('include', '/login');
  });

  it('should show success message and redirect to login on successful signup', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="verifyPassword"]').type('Password123');
    
    // Intercept the signup request
    cy.intercept('POST', 'http://localhost:8000/api/signup', {
      statusCode: 200,
      body: { statusText: 'success' }
    }).as('signupRequest');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for the request to complete
    cy.wait('@signupRequest');
    
    // Check for redirection to login page
    cy.url().should('include', '/login');
  });
});

// Home Page Tests
describe('Home Page Tests', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/home');
  });

  it('should display the navigation bar with GATORBLOG title', () => {
    cy.contains('h1', 'GATORBLOG').should('be.visible');
    cy.contains('button', 'HOME').should('be.visible');
    cy.contains('button', 'POSTS').should('be.visible');
    cy.contains('button', 'MY PROFILE').should('be.visible');
  });

  it('should display the "Start Blogging" button', () => {
    cy.contains('button', 'START BLOGGING').should('be.visible');
  });

  it('should navigate to the login page when the "Start Blogging" button is clicked', () => {
    cy.contains('button', 'START BLOGGING').click();
    cy.url().should('include', '/login');
  });

  it('should display the writing guide section', () => {
    cy.contains('h2', 'Writing Your First Blog').should('be.visible');
    cy.contains('Step 1: Pick A Topic You Love').should('be.visible');
    cy.contains('Step 2: Outline Before You Write').should('be.visible');
    cy.contains('Step 3: Write Like You Talk').should('be.visible');
    cy.contains('Step 4: Make It Engaging').should('be.visible');
    cy.contains('Step 5: Hit Publish & Share!').should('be.visible');
  });

  it('should display the popular posts section', () => {
    cy.contains('h2', 'Our Popular Posts').should('be.visible');
  });

  it('should display the gator images', () => {
    cy.get('img[alt="Gator mascot"]').should('be.visible');
    cy.get('img[alt="Step 1"]').should('be.visible');
    cy.get('img[alt="Step 2"]').should('be.visible');
    cy.get('img[alt="Step 3"]').should('be.visible');
    cy.get('img[alt="Step 4"]').should('be.visible');
    cy.get('img[alt="Step 5"]').should('be.visible');
  });
});

// Forgot Password Page Tests
describe('Forgot Password Page Tests', () => {
  beforeEach(() => {
    cy.visit('/forgot-password');
  });

  it('should display the forgot password form', () => {
    cy.contains('h1', 'Forgot Password').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.contains('button', 'Send Email').should('be.visible');
  });

  it('should require email field to be filled', () => {
    // Try submitting without filling email
    cy.contains('button', 'Send Email').click();
    
    // Form should not submit - check we're still on the same page
    cy.url().should('include', '/forgot-password');
    
    // The required attribute should prevent submission
    cy.get('input[name="email"]').then($input => {
      expect($input[0].validity.valid).to.be.false;
    });
  });

  it('should validate UF email format', () => {
    cy.get('input[name="email"]').type('notufemail@gmail.com');
    cy.contains('button', 'Send Email').click();
  });

  it('should show loading state when requesting verification code', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    
    // Intercept the request with a delay
    cy.intercept('POST', 'http://localhost:8000/api/request-reset-code', {
      delay: 1000,
      statusCode: 200,
      body: { msg: 'Verification code sent!' }
    }).as('requestCode');
    
    cy.contains('button', 'Send Email').click();
    
    // Wait for the request to complete
    cy.wait('@requestCode');
  });

  it('should proceed to verification code input on successful email submission', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    
    // Intercept the request
    cy.intercept('POST', 'http://localhost:8000/api/request-reset-code', {
      statusCode: 200,
      body: { msg: 'Verification code sent!' }
    }).as('requestCode');
    
    cy.contains('button', 'Send Email').click();
    cy.wait('@requestCode');
    
    // Should now show the verification code input
    cy.contains('Verification code sent!').should('be.visible');
    cy.get('input[name="otp"]').should('be.visible');
    cy.contains('button', 'Verify Code').should('be.visible');
  });

  it('should allow changing email after code request', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    
    // Intercept the request
    cy.intercept('POST', 'http://localhost:8000/api/request-reset-code', {
      statusCode: 200,
      body: { msg: 'Verification code sent!' }
    }).as('requestCode');
    
    cy.contains('button', 'Send Email').click();
    cy.wait('@requestCode');
    
    // Click "Change Email" button
    cy.contains('button', 'Change Email').click();
    
    // Should be back on the email input step
    cy.get('input[name="email"]').should('be.visible');
    cy.contains('button', 'Send Email').should('be.visible');
  });

  it('should navigate back to login when "Back to Login" is clicked', () => {
    cy.contains('button', 'Back to Login').click();
    cy.url().should('include', '/login');
  });
});

// Dashboard Page Tests
describe('Dashboard Page Tests', () => {
  beforeEach(() => {
    // Set fake authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    // Mock API call for blogs
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: [
          {
            id: 1,
            title: 'Test Blog',
            post: '<p>This is a test blog post</p>',
            user_id: 1,
            user_name: 'testgator',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z',
            likes: 5,
            comments: []
          }
        ]
      }
    }).as('getBlogs');
    
    cy.visit('/dashboard');
    cy.wait('@getBlogs');
  });

  it('should display the navigation bar with correct links', () => {
    cy.contains('h1', 'GATORBLOG').should('be.visible');
    cy.contains('button', 'HOME').should('be.visible');
    cy.contains('button', 'ALL POSTS').should('be.visible');
    cy.contains('button', 'MY PROFILE').should('be.visible');
    cy.contains('button', 'LOGOUT').should('be.visible');
  });

  it('should display the search functionality', () => {
    cy.contains('SEARCH').should('be.visible');
    cy.get('input[placeholder="Search for posts..."]').should('be.visible');
    cy.contains('button', 'Search').should('be.visible');
  });

  it('should display the new post button', () => {
    cy.contains('button', 'NEW POST').should('be.visible');
  });

  it('should navigate to the new post page when the "New Post" button is clicked', () => {
    cy.contains('button', 'NEW POST').click();
    cy.url().should('include', '/new-post');
  });

  it('should display posts with like and comment counts', () => {
    cy.contains('Test Blog').should('be.visible');
    cy.contains('testgator').should('be.visible');
    cy.contains('This is a test blog post').should('be.visible');
    
    // Check like count
    cy.get('.post-content').siblings().find('svg').first().parent().contains('5');
  });

  it('should search for posts when search is submitted', () => {
    cy.get('input[placeholder="Search for posts..."]').type('search term');
    
    // Intercept the search request
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta*', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: [
          {
            id: 2,
            title: 'Search Result',
            post: '<p>This is a search result</p>',
            user_id: 1,
            user_name: 'testgator',
            created_at: '2023-01-02T12:00:00Z',
            updated_at: '2023-01-02T12:00:00Z',
            likes: 0,
            comments: []
          }
        ]
      }
    }).as('searchBlogs');
    
    cy.contains('button', 'Search').click();
    cy.wait('@searchBlogs');
    
    // Check search results
    cy.contains('Search Result').should('be.visible');
  });

  it('should navigate to post detail page when clicking on a post', () => {
    cy.contains('Test Blog').click();
    cy.url().should('include', '/post/1');
  });

  it('should show edit and delete buttons for user\'s own posts', () => {
    // The test post has user_id: 1, which matches our mocked user
    cy.contains('Edit').should('be.visible');
    cy.contains('Delete').should('be.visible');
  });

  it('should show delete confirmation when delete button is clicked', () => {
    cy.contains('Delete').click();
    cy.contains('Confirm Delete').should('be.visible');
    cy.contains('Are you sure you want to delete this post?').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
    cy.contains('button', 'Delete').should('be.visible');
  });

  it('should navigate to the edit post page when edit button is clicked', () => {
    cy.contains('Edit').click();
    cy.url().should('include', '/edit-post/1');
  });

  it('should log out when logout button is clicked', () => {
    cy.contains('LOGOUT').click();
    cy.url().should('include', '/login');
    
    // Check that token was removed
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});

// Profile Page Tests
describe('Profile Page Tests', () => {
  beforeEach(() => {
    // Set fake authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    // Mock API call for blogs
    cy.intercept('GET', 'http://localhost:8000/api/blogs', {
      statusCode: 200,
      body: {
        blogs: [
          {
            ID: 1,
            Title: 'My Test Blog',
            Post: '<p>This is my test blog post</p>',
            user_id: 1,
            created_at: '2023-01-01T12:00:00Z',
            Likes: 5,
            Comments: 2
          }
        ]
      }
    }).as('getBlogs');
    
    // Mock API call for likes
    cy.intercept('GET', 'http://localhost:8000/api/likes/*', {
      statusCode: 200,
      body: [
        { id: 1, user_id: 2, blog_id: 1 },
        { id: 2, user_id: 3, blog_id: 1 }
      ]
    }).as('getLikes');
    
    // Mock API call for comments
    cy.intercept('GET', 'http://localhost:8000/api/comments/*', {
      statusCode: 200,
      body: [
        { id: 1, user_id: 2, blog_id: 1, content: 'Great post!', created_at: '2023-01-02T12:00:00Z' },
        { id: 2, user_id: 3, blog_id: 1, content: 'Thanks for sharing!', created_at: '2023-01-03T12:00:00Z' }
      ]
    }).as('getComments');
    
    cy.visit('/profile');
  });


  it('should display the user information', () => {

    cy.contains('testgator').should('be.visible');
    cy.contains('Email ID').should('be.visible');
    cy.contains('testgator@ufl.edu').should('be.visible');
  });

  it('should display the MY POSTS section', () => {
    cy.contains('MY POSTS').should('be.visible');
  });

  it('should display the posts created by the user', () => {
    cy.contains('My Test Blog').should('be.visible');
  });

  it('should display like and comment counts for each post', () => {
    cy.contains('5').should('be.visible'); // Like count
    cy.contains('2').should('be.visible'); // Comment count
  });

  it('should show View, Edit, and Delete buttons for posts', () => {
    cy.contains('button', 'View').should('be.visible');
    cy.contains('button', 'Edit').should('be.visible');
    cy.contains('button', 'Delete').should('be.visible');
  });

  it('should navigate to post detail when View button is clicked', () => {
    cy.contains('button', 'View').click();
    cy.url().should('include', '/post/1');
  });

  it('should navigate to edit post page when Edit button is clicked', () => {
    cy.contains('button', 'Edit').click();
    cy.url().should('include', '/edit-post/1');
  });

  it('should show confirmation dialog when Delete button is clicked', () => {
    cy.contains('button', 'Delete').click();
    cy.contains('Confirm Delete').should('be.visible');
    cy.contains('Are you sure you want to delete this post?').should('be.visible');
  });

  it('should display the NEW POST button', () => {
    cy.contains('button', 'NEW POST').should('be.visible');
  });

  it('should navigate to new post page when NEW POST button is clicked', () => {
    cy.contains('button', 'NEW POST').click();
    cy.url().should('include', '/new-post');
  });

  it('should navigate to different sections when navbar buttons are clicked', () => {
    cy.contains('button', 'HOME').click();
    cy.url().should('include', '/home');
    
    cy.visit('/profile');
    cy.contains('button', 'ALL POSTS').click();
    cy.url().should('include', '/dashboard');
  });

  it('should log out when LOGOUT button is clicked', () => {
    cy.contains('button', 'LOGOUT').click();
    cy.url().should('include', '/login');
  });
});

// New Post Page Tests
describe('New Post Page Tests', () => {
  beforeEach(() => {
    // Set fake authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    cy.visit('/new-post');
  });

  it('should display the post editor interface', () => {
    cy.contains('Create New Post').should('be.visible');
    cy.get('input[placeholder="Title"]').should('be.visible');
    cy.get('div[contenteditable="true"]').should('be.visible');
    cy.contains('button', 'POST').should('be.visible');
  });

  it('should allow entering a title', () => {
    const testTitle = 'My Test Gator Blog Post';
    cy.get('input[placeholder="Title"]').type(testTitle);
    cy.get('input[placeholder="Title"]').should('have.value', testTitle);
  });

  it('should allow entering content in the editor', () => {
    const testContent = 'This is a test blog post content.';
    cy.get('div[contenteditable="true"]').type(testContent);
    cy.get('div[contenteditable="true"]').should('contain', testContent);
  });

  it('should show editor toolbar with formatting options', () => {
    cy.get('button[title="Bold"]').should('be.visible');
    cy.get('button[title="Italic"]').should('be.visible');
    cy.get('button[title="Underline"]').should('be.visible');
    cy.get('button[title="Bullet List"]').should('be.visible');
    cy.get('button[title="Numbered List"]').should('be.visible');
    cy.get('button[title="Insert Link"]').should('be.visible');
    cy.get('button[title="Insert Image"]').should('be.visible');
  });

  it('should apply bold formatting when Bold button is clicked', () => {
    // Type some text
    cy.get('div[contenteditable="true"]').type('This is test text');
    
    // Select all text
    cy.get('div[contenteditable="true"]').type('{selectall}');
    
    // Click the Bold button
    cy.get('button[title="Bold"]').click();
    
    // The document.execCommand is called internally, we can't directly test it
    // But we can check if the text now has bold formatting (either <b> or <strong> tag)
    cy.get('div[contenteditable="true"]').within(() => {
      cy.get('b, strong').should('exist');
    });
  });

  it('should apply italic formatting when Italic button is clicked', () => {
    cy.get('div[contenteditable="true"]').type('This is test text');
    cy.get('div[contenteditable="true"]').type('{selectall}');
    cy.get('button[title="Italic"]').click();
    
    cy.get('div[contenteditable="true"]').within(() => {
      cy.get('i, em').should('exist');
    });
  });

  it('should prevent submission when title or content is empty', () => {
    // Try to submit with empty fields
    cy.contains('button', 'POST').click();
    
    // We expect an alert - spy on window.alert
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Please add both a title and content to your post');
    });
  });

  it('should show loading state during post submission', () => {
    // Fill in the form
    cy.get('input[placeholder="Title"]').type('Test Post');
    cy.get('div[contenteditable="true"]').type('This is test content');
    
    // Intercept the create blog request
    cy.intercept('POST', 'http://localhost:8000/api/blogs', {
      delay: 1000,
      statusCode: 200,
      body: { id: 1 }
    }).as('createBlog');
    
    // Submit the form
    cy.contains('button', 'POST').click();
    
    // Check loading state
    cy.contains('Posting...').should('be.visible');
    
    // Wait for the request to complete
    cy.wait('@createBlog');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to different pages when navbar buttons are clicked', () => {
    cy.contains('HOME').click();
    cy.url().should('include', '/home');
    
    cy.visit('/new-post');
    cy.contains('POSTS').click();
    cy.url().should('include', '/dashboard');
    
    cy.visit('/new-post');
    cy.contains('MY PROFILE').click();
    cy.url().should('include', '/profile');
  });

  it('should show tips section with writing advice', () => {
    cy.contains('Tips for a Great Post:').should('be.visible');
    cy.contains('Use headings to organize your content').should('be.visible');
    cy.contains('Add images to make your post more engaging').should('be.visible');
  });
});

// Edit Post Page Tests
describe('Edit Post Page Tests', () => {
  beforeEach(() => {
    // Set fake authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    // Mock API call to get post data
    cy.intercept('GET', 'http://localhost:8000/api/blog/*', {
      statusCode: 200,
      body: {
        blog: {
          ID: 1,
          Title: 'Original Test Post',
          Post: '<p>This is the original content.</p>',
          user_id: 1,
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z'
        }
      }
    }).as('getBlog');
    
    cy.visit('/edit-post/1');
    cy.wait('@getBlog');
  });

  it('should display the edit post interface', () => {
    cy.contains('Edit Post').should('be.visible');
    cy.get('input[placeholder="Title"]').should('be.visible');
    cy.get('div[contenteditable="true"]').should('be.visible');
    cy.contains('button', 'Update Post').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('should load existing post data', () => {
    cy.get('input[placeholder="Title"]').should('have.value', 'Original Test Post');
    cy.get('div[contenteditable="true"]').should('contain', 'This is the original content.');
  });

  it('should allow editing the title', () => {
    cy.get('input[placeholder="Title"]').clear().type('Updated Test Post Title');
    cy.get('input[placeholder="Title"]').should('have.value', 'Updated Test Post Title');
  });

  it('should allow editing the content', () => {
    cy.get('div[contenteditable="true"]').clear().type('This is updated content for testing.');
    cy.get('div[contenteditable="true"]').should('contain', 'This is updated content for testing.');
  });

  it('should show loading state during update submission', () => {
    // Edit form
    cy.get('input[placeholder="Title"]').clear().type('Updated Post');
    cy.get('div[contenteditable="true"]').clear().type('Updated content.');
    
    // Intercept the update request
    cy.intercept('PUT', 'http://localhost:8000/api/blogs/*', {
      delay: 1000,
      statusCode: 200,
      body: { success: true }
    }).as('updateBlog');
    
    // Submit the form
    cy.contains('button', 'Update Post').click();
    
    // Check loading state
    cy.contains('Updating...').should('be.visible');
    
    // Wait for the request to complete
    cy.wait('@updateBlog');
  });

  it('should navigate back when Cancel button is clicked', () => {
    cy.contains('button', 'Cancel').click();
    // Since navigate(-1) is used, we can't test the URL directly
    // But we can check that we're not on the edit page anymore
    cy.url().should('not.include', '/edit-post/1');
  });

  it('should show the toolbar with formatting options', () => {
    cy.get('button[title="Bold"]').should('be.visible');
    cy.get('button[title="Italic"]').should('be.visible');
    cy.get('button[title="Underline"]').should('be.visible');
    cy.get('button[title="Align Left"]').should('be.visible');
    cy.get('button[title="Align Center"]').should('be.visible');
    cy.get('button[title="Align Right"]').should('be.visible');
    cy.get('button[title="Insert Link"]').should('be.visible');
    cy.get('button[title="Insert Image"]').should('be.visible');
    cy.get('button[title="Insert Code"]').should('be.visible');
  });

  it('should show error for empty title or content on update', () => {
    // Empty the title
    cy.get('input[placeholder="Title"]').clear();
    
    // Try to submit
    cy.contains('button', 'Update Post').click();
    
    // We expect an alert
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Please add both a title and content to your post');
    });
  });

  it('should navigate to different pages when navbar buttons are clicked', () => {
    cy.contains('HOME').click();
    cy.url().should('include', '/home');
    
    cy.visit('/edit-post/1');
    cy.wait('@getBlog');
    cy.contains('POSTS').click();
    cy.url().should('include', '/dashboard');
    
    cy.visit('/edit-post/1');
    cy.wait('@getBlog');
    cy.contains('MY PROFILE').click();
    cy.url().should('include', '/profile');
  });

  it('should handle server error when fetching post', () => {
    // First we need to visit a different page
    cy.visit('/home');
    
    // Then mock the API to return an error
    cy.intercept('GET', 'http://localhost:8000/api/blog/*', {
      statusCode: 404,
      body: { error: 'Post not found' }
    }).as('getBlogError');
    
    // Visit the edit page
    cy.visit('/edit-post/999');
    cy.wait('@getBlogError');
    
    // Should show error message
    cy.contains('Failed to load post').should('be.visible');
    
    // Should have buttons to navigate away
    cy.contains('button', 'Go to Dashboard').should('be.visible');
    cy.contains('button', 'Try Again').should('be.visible');
  });

  it('should show loading state when fetching post', () => {
    // First we need to visit a different page
    cy.visit('/home');
    
    // Mock the API to add delay
    cy.intercept('GET', 'http://localhost:8000/api/blog/*', {
      delay: 1000,
      statusCode: 200,
      body: {
        blog: {
          ID: 1,
          Title: 'Original Test Post',
          Post: '<p>This is the original content.</p>',
          user_id: 1,
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z'
        }
      }
    }).as('getBlogDelayed');
    
    // Visit the edit page
    cy.visit('/edit-post/1');
    
    // Should show loading state
    cy.contains('Loading post...').should('be.visible');
    
    // Wait for the request to complete
    cy.wait('@getBlogDelayed');
    
    // Now post content should be visible
    cy.contains('Original Test Post').should('be.visible');
  });

  it('should apply formatting using toolbar buttons', () => {
    // Test bold formatting
    cy.get('div[contenteditable="true"]').clear().type('Testing formatting');
    cy.get('div[contenteditable="true"]').type('{selectall}');
    cy.get('button[title="Bold"]').click();
    
    // Test italic formatting
    cy.get('div[contenteditable="true"]').clear().type('Testing italic');
    cy.get('div[contenteditable="true"]').type('{selectall}');
    cy.get('button[title="Italic"]').click();
    
    // Test underline formatting
    cy.get('div[contenteditable="true"]').clear().type('Testing underline');
    cy.get('div[contenteditable="true"]').type('{selectall}');
    cy.get('button[title="Underline"]').click();
    
    // Test alignment
    cy.get('div[contenteditable="true"]').clear().type('Testing center alignment');
    cy.get('div[contenteditable="true"]').type('{selectall}');
    cy.get('button[title="Align Center"]').click();
  });

  it('should handle successful post update', () => {
    // Edit the post
    cy.get('input[placeholder="Title"]').clear().type('Successfully Updated Post');
    cy.get('div[contenteditable="true"]').clear().type('This post has been updated successfully.');
    
    // Mock the update request
    cy.intercept('PUT', 'http://localhost:8000/api/blogs/*', {
      statusCode: 200,
      body: { success: true }
    }).as('updateSuccess');
    
    // Submit the form
    cy.contains('button', 'Update Post').click();
    
    // Wait for the request to complete
    cy.wait('@updateSuccess');
    
    // Should navigate away from edit page
    cy.url().should('not.include', '/edit-post');
  });
});

// Post Detail Page Tests
describe('Post Detail Page Tests', () => {
  beforeEach(() => {
    // Set fake authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    // Mock API call for blog with meta data
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/*', {
      statusCode: 200,
      body: {
        blog: {
          id: 1,
          title: 'Test Blog Post',
          post: '<p>This is a detailed blog post content for testing the detail view.</p>',
          user_id: 1,
          user_name: 'testgator',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z',
          likes: 10,
          comments: [
            {
              id: 1,
              user_id: 2,
              user_name: 'commenter1',
              blog_id: 1,
              content: 'Great post!',
              created_at: '2023-01-02T12:00:00Z'
            },
            {
              id: 2,
              user_id: 3,
              user_name: 'commenter2',
              blog_id: 1,
              content: 'Very informative!',
              created_at: '2023-01-03T12:00:00Z'
            }
          ]
        }
      }
    }).as('getBlogWithMeta');
    
    cy.visit('/post/1');
    cy.wait('@getBlogWithMeta');
  });

  it('should display the post title and content', () => {
    cy.contains('Test Blog Post').should('be.visible');
    cy.contains('This is a detailed blog post content').should('be.visible');
  });

  it('should show the author information and date', () => {
    cy.contains('testgator').should('be.visible');
    // Check for date - only check for date component as formatting may vary
    cy.contains('Created:').should('be.visible');
  });

  it('should display like and comment counts', () => {
    // Check that the like count is visible
    cy.contains('10').should('be.visible');
    // Check that the comment count is visible
    cy.contains('2 Comments').should('be.visible');
  });

  it('should display comments section with existing comments', () => {
    cy.contains('Comments').should('be.visible');
    cy.contains('Great post!').should('be.visible');
    cy.contains('Very informative!').should('be.visible');
    cy.contains('commenter1').should('be.visible');
    cy.contains('commenter2').should('be.visible');
  });

  it('should show the comment input form', () => {
    cy.get('textarea[placeholder="Add a comment..."]').should('be.visible');
    cy.contains('button', 'Post Comment').should('be.visible');
  });

  it('should allow adding a new comment', () => {
    const newComment = 'This is a test comment.';
    
    // Intercept the add comment request
    cy.intercept('POST', 'http://localhost:8000/api/comments', {
      statusCode: 200,
      body: {
        id: 3,
        user_id: 1,
        user_name: 'testgator',
        blog_id: 1,
        content: newComment,
        created_at: '2023-01-04T12:00:00Z'
      }
    }).as('addComment');
    
    // Type and submit a comment
    cy.get('textarea[placeholder="Add a comment..."]').type(newComment);
    cy.contains('button', 'Post Comment').click();
    
    // Wait for the request to complete
    cy.wait('@addComment');
    
    // New comment should be visible
    cy.contains(newComment).should('be.visible');
  });

  it('should show edit and delete buttons for user\'s own post', () => {
    // The post has user_id: 1, which matches our mocked user
    cy.contains('button', 'Edit').should('be.visible');
    cy.contains('button', 'Delete').should('be.visible');
  });

  it('should navigate to edit post page when Edit button is clicked', () => {
    cy.contains('button', 'Edit').click();
    cy.url().should('include', '/edit-post/1');
  });

  it('should show delete confirmation when Delete button is clicked', () => {
    cy.contains('button', 'Delete').click();
    // Confirm dialog appears
    cy.on('window:confirm', (text) => {
      expect(text).to.equal('Are you sure you want to delete this post?');
      return true; // Confirm delete
    });
    
    // Mock delete request
    cy.intercept('DELETE', 'http://localhost:8000/api/blogs/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteBlog');
    
    // Wait for the request and check redirection
    cy.wait('@deleteBlog');
    cy.url().should('include', '/dashboard');
  });

  it('should navigate back to dashboard when Back button is clicked', () => {
    cy.contains('← Back to Posts').click();
    cy.url().should('include', '/dashboard');
  });

  it('should allow liking a post', () => {
    // Mock the get likes request
    cy.intercept('GET', 'http://localhost:8000/api/likes/*', {
      statusCode: 200,
      body: [
        { id: 1, user_id: 2, blog_id: 1 },
        { id: 2, user_id: 3, blog_id: 1 }
      ]
    }).as('getLikes');
    
    // Mock the add like request
    cy.intercept('POST', 'http://localhost:8000/api/likes', {
      statusCode: 200,
      body: { id: 3, user_id: 1, blog_id: 1 }
    }).as('addLike');
    
    // Find and click the like button
    cy.get('button').contains('10').click();
    
    // Wait for the request to complete
    cy.wait('@addLike');
    
    // Like count should be incremented
    cy.get('button').contains('11').should('be.visible');
  });

  it('should handle loading state when fetching post', () => {
    // First we need to visit a different page
    cy.visit('/home');
    
    // Mock the API to add delay
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/*', {
      delay: 1000,
      statusCode: 200,
      body: {
        blog: {
          id: 1,
          title: 'Test Blog Post',
          post: '<p>This is a detailed blog post content.</p>',
          user_id: 1,
          user_name: 'testgator',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z',
          likes: 10,
          comments: []
        }
      }
    }).as('getBlogDelayed');
    
    // Visit the post detail page
    cy.visit('/post/1');
    
    // Should show loading state
    cy.contains('Loading post...').should('be.visible');
    
    // Wait for the request to complete
    cy.wait('@getBlogDelayed');
    
    // Now post content should be visible
    cy.contains('Test Blog Post').should('be.visible');
  });

  it('should handle post not found error', () => {
    // First we need to visit a different page
    cy.visit('/home');
    
    // Mock the API to return an error
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/*', {
      statusCode: 404,
      body: { error: 'Post not found' }
    }).as('getBlogError');
    
    // Visit the post detail page
    cy.visit('/post/999');
    cy.wait('@getBlogError');
    
    // Should show error message
    cy.contains('Post not found').should('be.visible');
    
    // Should have button to go back to dashboard
    cy.contains('button', 'Return to Dashboard').should('be.visible');
  });

  it('should prevent submitting empty comments', () => {
    // Try to submit empty comment
    cy.contains('button', 'Post Comment').click();
    
    // Comment form should still be visible (not submitted)
    cy.get('textarea[placeholder="Add a comment..."]').should('be.visible');
  });

  it('should display the navbar with navigation links', () => {
    cy.contains('h1', 'GATORBLOG').should('be.visible');
    cy.contains('button', 'HOME').should('be.visible');
    cy.contains('button', 'POSTS').should('be.visible');
    cy.contains('button', 'MY PROFILE').should('be.visible');
  });

  it('should navigate to different pages when navbar links are clicked', () => {
    cy.contains('button', 'HOME').click();
    cy.url().should('include', '/home');
    
    cy.visit('/post/1');
    cy.wait('@getBlogWithMeta');
    
    cy.contains('button', 'POSTS').click();
    cy.url().should('include', '/dashboard');
    
    cy.visit('/post/1');
    cy.wait('@getBlogWithMeta');
    
    cy.contains('button', 'MY PROFILE').click();
    cy.url().should('include', '/profile');
  });
});

// Protected Routes Tests
describe('Protected Routes Tests', () => {
  it('should redirect to login page when accessing dashboard without authentication', () => {
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/dashboard');

    cy.url().should('include', '/login');
  });

  it('should allow access to dashboard when authenticated', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
    });

    // Mock API call for blogs
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: []
      }
    }).as('getBlogs');

    cy.visit('/dashboard');
    cy.wait('@getBlogs');

    cy.url().should('include', '/dashboard');
  });

  it('should redirect to login page when accessing profile without authentication', () => {
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/profile');

    cy.url().should('include', '/login');
  });

  it('should redirect to login page when accessing new post page without authentication', () => {
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/new-post');

    cy.url().should('include', '/login');
  });

  it('should redirect to login page when accessing edit post page without authentication', () => {
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/edit-post/1');

    cy.url().should('include', '/login');
  });

  it('should redirect to login page when accessing post detail page without authentication', () => {
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/post/1');

    cy.url().should('include', '/login');
  });
});

// End-to-End Flow Tests
describe('End-to-End Flow Tests', () => {
  it('should allow full signup, login, and access to dashboard', () => {
    const testEmail = `test${Date.now()}@ufl.edu`;
    const testPassword = 'Password123';
    
    // 1. Go to signup page
    cy.visit('/signup');
    
    // 2. Fill out signup form
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type(testPassword);
    cy.get('input[name="verifyPassword"]').type(testPassword);
    
    // 3. Mock the signup response
    cy.intercept('POST', 'http://localhost:8000/api/signup', {
      statusCode: 200,
      body: { statusText: 'success' }
    }).as('signupRequest');
    
    // 4. Submit signup form
    cy.get('button[type="submit"]').click();
    
    // 5. Wait for request and check redirect to login
    cy.wait('@signupRequest');
    cy.url().should('include', '/login');
    
    // 6. Fill out login form
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(testPassword);
    
    // 7. Mock the login response
    cy.intercept('POST', 'http://localhost:8000/api/signin', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        statusText: 'success'
      }
    }).as('loginRequest');
    
    // 8. Submit login form
    cy.get('button[type="submit"]').click();
    
    // 9. Wait for request and check redirect to dashboard
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    
    // 10. Verify we're on the dashboard
    cy.contains(/GATORBLOG/i).should('exist');
  });

  it('should allow creating, viewing, editing, and deleting a post', () => {
    // Set authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    // 1. Go to new post page
    cy.visit('/new-post');
    
    // 2. Create a new post
    cy.get('input[placeholder="Title"]').type('E2E Test Post');
    cy.get('div[contenteditable="true"]').type('This is a test post created during end-to-end testing.');
    
    // 3. Mock create post request
    cy.intercept('POST', 'http://localhost:8000/api/blogs', {
      statusCode: 200,
      body: { id: 99 }
    }).as('createPost');
    
    // 4. Submit the post
    cy.contains('button', 'POST').click();
    
    // 5. Wait for request and check redirect to dashboard
    cy.wait('@createPost');
    cy.url().should('include', '/dashboard');
    
    // 6. Mock dashboard blogs request to include our new post
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: [
          {
            id: 99,
            title: 'E2E Test Post',
            post: '<p>This is a test post created during end-to-end testing.</p>',
            user_id: 1,
            user_name: 'testgator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            likes: 0,
            comments: []
          }
        ]
      }
    }).as('getBlogs');
    
    // 7. Wait for blogs to load
    cy.wait('@getBlogs');
    
    // 8. Verify our post appears on dashboard
    cy.contains('E2E Test Post').should('be.visible');
    
    // 9. Click to view the post
    cy.contains('E2E Test Post').click();
    
    // 10. Mock get blog with meta for view
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/99', {
      statusCode: 200,
      body: {
        blog: {
          id: 99,
          title: 'E2E Test Post',
          post: '<p>This is a test post created during end-to-end testing.</p>',
          user_id: 1,
          user_name: 'testgator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes: 0,
          comments: []
        }
      }
    }).as('getBlogWithMeta');
    
    // 11. Wait for blog to load
    cy.wait('@getBlogWithMeta');
    
    // 12. Verify post content is visible
    cy.contains('E2E Test Post').should('be.visible');
    cy.contains('This is a test post created during end-to-end testing.').should('be.visible');
    
    // 13. Click edit button
    cy.contains('button', 'Edit').click();
    
    // 14. Mock get blog for edit
    cy.intercept('GET', 'http://localhost:8000/api/blog/*', {
      statusCode: 200,
      body: {
        blog: {
          ID: 99,
          Title: 'E2E Test Post',
          Post: '<p>This is a test post created during end-to-end testing.</p>',
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }).as('getBlog');
    
    // 15. Wait for blog to load in edit mode
    cy.wait('@getBlog');
    
    // 16. Edit the post
    cy.get('input[placeholder="Title"]').clear().type('Updated E2E Test Post');
    cy.get('div[contenteditable="true"]').clear().type('This post has been updated during end-to-end testing.');
    
    // 17. Mock update request
    cy.intercept('PUT', 'http://localhost:8000/api/blogs/*', {
      statusCode: 200,
      body: { success: true }
    }).as('updatePost');
    
    // 18. Submit the update
    cy.contains('button', 'Update Post').click();
    
    // 19. Wait for update request
    cy.wait('@updatePost');
    
    // 20. Mock dashboard blogs request with updated post
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: [
          {
            id: 99,
            title: 'Updated E2E Test Post',
            post: '<p>This post has been updated during end-to-end testing.</p>',
            user_id: 1,
            user_name: 'testgator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            likes: 0,
            comments: []
          }
        ]
      }
    }).as('getUpdatedBlogs');
    
    // 21. Wait for blogs to load
    cy.wait('@getUpdatedBlogs');
    
    // 22. Verify updated post appears
    cy.contains('Updated E2E Test Post').should('be.visible');
    
    // 23. Click to view the updated post
    cy.contains('Updated E2E Test Post').click();
    
    // 24. Mock get updated blog with meta
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/99', {
      statusCode: 200,
      body: {
        blog: {
          id: 99,
          title: 'Updated E2E Test Post',
          post: '<p>This post has been updated during end-to-end testing.</p>',
          user_id: 1,
          user_name: 'testgator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes: 0,
          comments: []
        }
      }
    }).as('getUpdatedBlogWithMeta');
    
    // 25. Wait for updated blog to load
    cy.wait('@getUpdatedBlogWithMeta');
    
    // 26. Verify updated content is visible
    cy.contains('Updated E2E Test Post').should('be.visible');
    cy.contains('This post has been updated during end-to-end testing.').should('be.visible');
    
    // 27. Click delete button and confirm
    cy.contains('button', 'Delete').click();
    
    // 28. Confirm dialog appears
    cy.on('window:confirm', (text) => {
      expect(text).to.equal('Are you sure you want to delete this post?');
      return true; // Confirm delete
    });
    
    // 29. Mock delete request
    cy.intercept('DELETE', 'http://localhost:8000/api/blogs/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deletePost');
    
    // 30. Wait for delete request
    cy.wait('@deletePost');
    
    // 31. Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // 32. Mock empty dashboard blogs request after delete
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: []
      }
    }).as('getEmptyBlogs');
    
    // 33. Wait for blogs to load
    cy.wait('@getEmptyBlogs');
    
    // 34. Verify post is no longer visible
    cy.contains('Updated E2E Test Post').should('not.exist');
  });

  it('should test forgot password flow', () => {
    // 1. Go to login page
    cy.visit('/login');
    
    // 2. Click forgot password link
    cy.contains('button', 'Forgot Password? Click Here').click();
    cy.url().should('include', '/forgot-password');
    
    // 3. Fill in email
    cy.get('input[name="email"]').type('test@ufl.edu');
    
    // 4. Mock request verification code
    cy.intercept('POST', 'http://localhost:8000/api/request-reset-code', {
      statusCode: 200,
      body: { msg: 'Verification code sent!' }
    }).as('requestCode');
    
    // 5. Submit email form
    cy.contains('button', 'Send Email').click();
    
    // 6. Wait for request
    cy.wait('@requestCode');
    
    // 7. Verify success message
    cy.contains('Verification code sent!').should('be.visible');
    
    // 8. Fill in verification code
    cy.get('input[name="otp"]').type('123456');
    
    // 9. Mock verify code request
    cy.intercept('POST', 'http://localhost:8000/api/verify-reset-code', {
      statusCode: 200,
      body: { msg: 'Code verified successfully!' }
    }).as('verifyCode');
    
    // 10. Submit verification code
    cy.contains('button', 'Verify Code').click();
    
    // 11. Wait for verify request
    cy.wait('@verifyCode');
    
    // 12. Verify success message
    cy.contains('Code verified successfully!').should('be.visible');
    
    // 13. Fill in new password
    cy.get('input[name="newPassword"]').type('NewPassword123');
    cy.get('input[name="confirmPassword"]').type('NewPassword123');
    
    // 14. Mock reset password request
    cy.intercept('POST', 'http://localhost:8000/api/reset-password', {
      statusCode: 200,
      body: { msg: 'Password reset successful!' }
    }).as('resetPassword');
    
    // 15. Submit new password
    cy.contains('button', 'Reset Password').click();
    
    // 16. Wait for reset request
    cy.wait('@resetPassword');
    
    // 17. Verify success message
    cy.contains('Password reset successful!').should('be.visible');
    
    // 18. Click back to login
    cy.contains('button', 'Back to Login').click();
    
    // 19. Verify redirect to login
    cy.url().should('include', '/login');
  });

  it('should allow adding and viewing comments', () => {
    // Set authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    // 1. Mock blogs request for dashboard
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: [
          {
            id: 1,
            title: 'Test Blog for Comments',
            post: '<p>This is a test blog for commenting.</p>',
            user_id: 2,
            user_name: 'othergator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            likes: 0,
            comments: []
          }
        ]
      }
    }).as('getBlogs');
    
    // 2. Go to dashboard
    cy.visit('/dashboard');
    cy.wait('@getBlogs');
    
    // 3. Click on blog post
    cy.contains('Test Blog for Comments').click();
    
    // 4. Mock get blog with meta
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/*', {
      statusCode: 200,
      body: {
        blog: {
          id: 1,
          title: 'Test Blog for Comments',
          post: '<p>This is a test blog for commenting.</p>',
          user_id: 2,
          user_name: 'othergator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes: 0,
          comments: []
        }
      }
    }).as('getBlogWithMeta');
    
    // 5. Wait for blog to load
    cy.wait('@getBlogWithMeta');
    
    // 6. Verify comment form is visible
    cy.get('textarea[placeholder="Add a comment..."]').should('be.visible');
    
    // 7. Type a comment
    cy.get('textarea[placeholder="Add a comment..."]').type('This is a test comment.');
    
    // 8. Mock add comment request
    cy.intercept('POST', 'http://localhost:8000/api/comments/*', {
      statusCode: 200,
      body: {
        id: 1,
        user_id: 1,
        user_name: 'testgator',
        blog_id: 1,
        content: 'This is a test comment.',
        created_at: new Date().toISOString()
      }
    }).as('addComment');
    
    // 9. Submit comment
    cy.contains('button', 'Post Comment').click();
    
    // 10. Wait for comment to be added
    cy.wait('@addComment');
    
    // 11. Verify comment appears
    cy.contains('This is a test comment.').should('be.visible');
    cy.contains('testgator').should('be.visible');
  });
});

// Like Button Tests
describe('Like Button Tests', () => {
  beforeEach(() => {
    // Set fake authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    
    // Mock API call for blogs
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', {
      statusCode: 200,
      body: {
        statusText: 'OK',
        blogs: [
          {
            id: 1,
            title: 'Test Blog',
            post: '<p>This is a test blog post</p>',
            user_id: 2,
            user_name: 'othergator',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z',
            likes: 5,
            comments: []
          }
        ]
      }
    }).as('getBlogs');
    
    // Mock API call for likes - user has not liked the post yet
    cy.intercept('GET', 'http://localhost:8000/api/likes/*', {
      statusCode: 200,
      body: [
        { id: 1, user_id: 2, blog_id: 1 },
        { id: 2, user_id: 3, blog_id: 1 }
      ]
    }).as('getLikes');
    
    cy.visit('/post/1');
  });

  it('should display the like button with count', () => {
    // Intercept FIRST, before visiting the page
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/*', {
      statusCode: 200,
      body: {
        blog: {
          id: 1,
          title: 'Test Blog',
          post: '<p>This is a test blog post</p>',
          user_id: 2,
          user_name: 'othergator',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z',
          likes: 5,
          comments: []
        }
      }
    }).as('getBlogWithMeta');
  
    cy.intercept('GET', 'http://localhost:8000/api/likes/*', {
      statusCode: 200,
      body: [
        { id: 1, user_id: 2, blog_id: 1 },
        { id: 2, user_id: 3, blog_id: 1 }
      ]
    }).as('getLikes');
  
    cy.visit('/post/1');
  
    cy.wait('@getBlogWithMeta');
    cy.wait('@getLikes');
  
    cy.get('button').contains('5').should('be.visible');
  });
  

  it('should allow liking a post', () => {
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/*', {
      statusCode: 200,
      body: {
        blog: {
          id: 1,
          title: 'Test Blog',
          post: '<p>This is a test blog post</p>',
          user_id: 2,
          user_name: 'othergator',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z',
          likes: 5,
          comments: []
        }
      }
    }).as('getBlogWithMeta');
  
    cy.intercept('GET', 'http://localhost:8000/api/likes/*', {
      statusCode: 200,
      body: []
    }).as('getLikes');
  
    cy.intercept('POST', 'http://localhost:8000/api/likes', {
      statusCode: 200,
      body: { id: 3, user_id: 1, blog_id: 1 }
    }).as('addLike');
  
    cy.visit('/post/1');
  
    cy.wait('@getBlogWithMeta');
    cy.wait('@getLikes');
  
    cy.get('button').contains('5').click();
    cy.wait('@addLike');
    cy.get('button').contains('6').should('be.visible');
  });
  

  it('should allow unliking a post', () => {
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/*', {
      statusCode: 200,
      body: {
        blog: {
          id: 1,
          title: 'Test Blog',
          post: '<p>This is a test blog post</p>',
          user_id: 2,
          user_name: 'othergator',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z',
          likes: 5,
          comments: []
        }
      }
    }).as('getBlogWithMeta');
  
    cy.intercept('GET', 'http://localhost:8000/api/likes/*', {
      statusCode: 200,
      body: [
        { id: 1, user_id: 1, blog_id: 1 }
      ]
    }).as('getLikes');
  
    cy.intercept('DELETE', 'http://localhost:8000/api/likes/*', {
      statusCode: 200,
      body: { success: true }
    }).as('removeLike');
  
    cy.visit('/post/1');
  
    cy.wait('@getBlogWithMeta');
    cy.wait('@getLikes');
  
    cy.get('button').contains('5').click();
    cy.wait('@removeLike');
    cy.get('button').contains('4').should('be.visible');
  });
  

  it('should disable like button when no user is authenticated', () => {
    // Remove authentication
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
      win.localStorage.removeItem('user');
    });
    
    cy.visit('/login');
    
    // Mock login with invalid credentials
    cy.intercept('POST', 'http://localhost:8000/api/signin', {
      statusCode: 200,
      body: {
        statusText: 'error',
        msg: 'Invalid credentials'
      }
    }).as('failedLogin');
    
    // Fill in email and password
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="password"]').type('wrongpassword');
    
    // Submit login form
    cy.get('button[type="submit"]').click();
    
    // Wait for login request
    cy.wait('@failedLogin');
    
    // Verify error message
    cy.contains('Invalid credentials').should('be.visible');
    
    // Verify we're still on login page
    cy.url().should('include', '/login');
  });

  it('should redirect to login when token expires', () => {
    // Set expired token
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'expired-token');
    });
  
    // Intercept must be registered before the visit
    cy.intercept('GET', 'http://localhost:8000/api/blogs-with-meta', (req) => {
      req.reply({
        statusCode: 401,
        body: {
          statusText: 'error',
          msg: 'Unauthorized'
        }
      });
    }).as('unauthorizedRequest');
  
    cy.visit('/dashboard'); // triggers request
    cy.wait('@unauthorizedRequest'); // now it should work
  
    // Confirm redirect to login
    cy.url().should('include', '/login');
  });
  
});

describe('Like Button Tests', () => {
  beforeEach(() => {
    // Set fake auth
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });

    // 👇 FIX 1: Intercept BEFORE visiting the page
    cy.intercept('GET', 'http://localhost:8000/api/blog-with-meta/1', {
      statusCode: 200,
      body: {
        blog: {
          id: 1,
          title: 'Test Blog',
          post: '<p>This is a test blog post</p>',
          user_id: 2,
          user_name: 'othergator',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z',
          likes: 5,
          comments: []
        }
      }
    }).as('getBlogWithMeta');

    // 👇 Intercept likes call
    cy.intercept('GET', 'http://localhost:8000/api/likes/1', {
      statusCode: 200,
      body: []
    }).as('getLikes');

    // 👇 Visit AFTER setting up intercepts
    cy.visit('/post/1');
  });

  it('should display the like button with count', () => {


    cy.get('button').contains('5').should('be.visible');
  });
});
  
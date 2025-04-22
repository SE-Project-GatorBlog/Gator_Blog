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


  it('should show tips section with writing advice', () => {
    cy.contains('Tips for a Great Post:').should('be.visible');
    cy.contains('Use headings to organize your content').should('be.visible');
    cy.contains('Add images to make your post more engaging').should('be.visible');
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

  it('should redirect to login page when accessing new post page without authentication', () => {
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/new-post');

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
});



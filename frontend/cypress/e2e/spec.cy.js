// Cypress Tests for GatorBlog Application

// Home Page Tests
describe('Home Page Tests', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

// New Post Page Tests
describe('New Post Page Tests', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    cy.visit('/new-post');
  });
  
  it('should display the post editor interface', () => {
    cy.get('input[placeholder="Title"]').should('be.visible');
    cy.get('div[contenteditable="true"]').should('be.visible');
    cy.get('button').contains('POST').should('be.visible');
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
    cy.get('div[contenteditable="true"]').type('This is {selectall}');
    
    // Click the Bold button
    cy.get('button[title="Bold"]').click();
    
    // Check that bold formatting was applied (by checking if execCommand was called)
    cy.window().then((win) => {
      cy.spy(win.document, 'execCommand').as('execCommand');
      cy.get('button[title="Bold"]').click();
      cy.get('@execCommand').should('be.calledWith', 'bold', false, null);
    });
  });
  
  it('should navigate back to dashboard when HOME button is clicked', () => {
    // Click the HOME button in the navbar
    cy.contains('HOME').click();
    
    // Check URL changed to dashboard
    cy.url().should('include', '/home');
  });
  
  it('should show tips section with writing advice', () => {
    // Check tips section exists
    cy.contains('Tips for a Great Post:').should('be.visible');
    cy.contains('Use headings to organize your content').should('be.visible');
    cy.contains('Add images to make your post more engaging').should('be.visible');
  });
});

  it('should display the "Start Blogging" button', () => {
    // Check if the "Start Blogging" button is visible
    cy.get('button').contains('START BLOGGING').should('be.visible');
  });

  it('should navigate to the login page when the "Start Blogging" button is clicked', () => {
    // Click the "Start Blogging" button and check if the URL is correct
    cy.get('button').contains('START BLOGGING').click();
    cy.url().should('include', '/login');
  });
});

// Login Page Tests
describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login button', () => {
    // Check if the "Login" button is visible
    cy.get('button').contains('Log In').should('be.visible');
  });

  it('should display the "New User? Sign Up Here" button', () => {
    // Check if the "New User? Sign Up Here" button is visible
    cy.get('button').contains('New User? Sign Up Here').should('be.visible');
  });

  it('should navigate to the signup page when the "New User? Sign Up Here" button is clicked', () => {
    // Click the "New User? Sign Up Here" button and check if the URL is correct
    cy.get('button').contains('New User? Sign Up Here').click();
    cy.url().should('include', '/signup');
  });

  it('should display the forgot password link', () => {
    // Check if the "Forgot Password?" link is visible
    cy.get('button').contains('Forgot Password? Click Here').should('be.visible');
  });

  it('should navigate to the forgot password page when the "Forgot Password?" link is clicked', () => {
    // Click the "Forgot Password?" link and check if the URL is correct
    cy.get('button').contains('Forgot Password? Click Here').click();
    cy.url().should('include', '/forgot-password');
  });
  
  it('should validate UF email format', () => {
    // Fill in non-UF email
    cy.get('input[name="email"]').type('test@gmail.com');
    cy.get('input[name="password"]').type('Password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Check error message
    cy.contains('Please use your UF email address (@ufl.edu)').should('be.visible');
  });

  it('should show loading state during login', () => {
    // Fill in valid credentials
    cy.get('input[name="email"]').type('durgas@ufl.edu');
    cy.get('input[name="password"]').type('S@1234567');
    
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

    cy.contains('Please use your UF email address (@ufl.edu)').should('be.visible');
  });

  it('should validate username format', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="username"]').type('test-user$');
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="verifyPassword"]').type('Password123');

    cy.get('button[type="submit"]').click();

    cy.contains('Username can only contain letters, numbers, underscores (_) and periods (.)').should('be.visible');
  });

  it('should validate password requirements', () => {
    cy.get('input[name="email"]').type('test@ufl.edu');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password');
    cy.get('input[name="verifyPassword"]').type('password');

    cy.get('button[type="submit"]').click();

    cy.contains('Password must be at least 8 characters long, contain one capital letter and one number').should('be.visible');
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

    cy.get('input[name="password"]').parent().find('button').click();

    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
  });
});

describe('Forgot Password Page Tests', () => {
  beforeEach(() => {
    cy.visit('/forgot-password');
  });

  it('should display the email input field', () => {
    cy.get('input[name="email"]').should('be.visible');
  });

  it('should have a "Send Verification Code" button', () => {
    cy.contains('Send Verification Code').should('be.visible');
  });

  it('should prevent submission if email is empty', () => {
    cy.get('form').then(($form) => {
      expect($form[0].checkValidity()).to.be.false;
    });
  
    cy.get('button').contains('Send Verification Code').click();
  
    // Optionally assert that you're still on the page
    cy.url().should('include', '/forgot-password');
  });
  

  it('should show validation error for non-UF email', () => {
    cy.get('input[name="email"]').type('notufemail@gmail.com');
    cy.contains('Send Verification Code').click();
    cy.contains('Please enter a valid @ufl.edu email address').should('be.visible');
  });

  it('should navigate back to login when "Back to Login" is clicked', () => {
    cy.contains('Back to Login').click();
    cy.url().should('include', '/login');
  });
});


// Dashboard Page Tests
describe('Dashboard Page Tests', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
    });
    cy.visit('/dashboard');
  });

  it('should display the new post button', () => {
    cy.get('button').contains('NEW POST').should('be.visible');
  });

  it('should navigate to the new post page when the "New Post" button is clicked', () => {
    cy.get('button').contains('NEW POST').click();
    cy.url().should('include', '/new-post');
  });

  it('should display the search bar', () => {
    cy.get('input').should('be.visible');
  });

  it('should be able to type in the search bar', () => {
    cy.get('input').type('test').should('have.value', 'test');
  });
});


describe('Profile Page Tests', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({
        username: 'testgator',
        email: 'testgator@ufl.edu'
      }));
    });
    cy.visit('/profile');
  });

  it('should display the username and email', () => {
    cy.contains('Username').should('exist');
    cy.contains('Email ID').should('exist');
  });

  it('should show the profile image (even if default)', () => {
    cy.get('img').should('exist');
  });

  it('should show a MY POSTS section', () => {
    cy.contains('MY POSTS').should('exist');
  });

  it('should display the NEW POST button and navigate when clicked', () => {
    cy.contains('NEW POST').should('be.visible').click();
    cy.url().should('include', '/new-post');
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

    cy.visit('/dashboard');

    cy.url().should('include', '/dashboard');
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
    
    // 10. Verify we're on the dashboard - look for any content we know is on the dashboard
    cy.contains(/GATORBLOG/i).should('exist');
  });
});
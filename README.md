# Gator_Blog

## Team Members:
- **Durga Sritha Dongla** - Front End
- **KJ Pressly** - Front End
- **Saranya Yadlapalli** - Back End
- **Sai Harshitha Baskar** - Back End

## Project Description:
The UF Student Blog Website is an interactive platform designed to foster connection and community among students at the University of Florida. This application allows students to share life updates, create engaging blog posts, and stay connected with their peers.

This blog website is designed to be an inclusive digital space where UF students can express themselves, share ideas, and build a stronger sense of community.

### Core Features:
- User Authentication and Profiles
- Blog Creation and Editing
- Feed Page
- Post Management
- User Dashboard
  
### Workflow

![Workflow Diagram](images/Gator_Blog_WorkFlow)

## How to Run:

### Prerequisites:
- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)

## Implementation Steps:

### 1. Set up the project
```bash
npx create-react-app frontend
cd frontend
```

### 2. Install required dependencies
```bash
npm install react-router-dom lucide-react tailwindcss postcss autoprefixer
```

### 3. Configure Tailwind CSS
```bash
npx tailwindcss init -p
```

### 4. Create the necessary directories
```bash
mkdir -p src/components/{Login,SignUp,ForgotPassword}
mkdir -p src/pages
mkdir -p src/assets/images
```

### 5. Add routing configuration
- Implement the `App.js` file with React Router setup
- Create the page components that will render the forms

### 6. Implement the components
- Create `LoginForm.jsx`, `SignUpForm.jsx`, and `ForgotPassword.jsx`
- Implement form validation and state management using React hooks
- Add styling using Tailwind CSS classes

### 7. Add image assets
- Place the Gator mascot images in the `src/assets/images` directory

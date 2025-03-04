import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';  // Import MemoryRouter
import HomePage from './components/Home/HomePage';  // Adjust path as needed
//import LoginForm from './components/Login/LoginForm';
import { act } from 'react-dom/test-utils';

test('renders START BLOGGING button', () => {
  render(
    <MemoryRouter>  {/* ✅ Wrap component in MemoryRouter */}
      <HomePage />
    </MemoryRouter>
  );

  const buttonElement = screen.getByRole('button', { name: /start blogging/i });
  expect(buttonElement).toBeInTheDocument();
})

test('renders HOME button', () => {
  render(
    <MemoryRouter>  {/* ✅ Wrap component in MemoryRouter */}
      <HomePage />
    </MemoryRouter>
  );

  const buttonElement = screen.getByRole('button', { name: /home/i });
  expect(buttonElement).toBeInTheDocument();
})

test('renders MY PROFILE button', () => {
  render(
    <MemoryRouter>  {/* ✅ Wrap component in MemoryRouter */}
      <HomePage />
    </MemoryRouter>
  );

  const buttonElement = screen.getByRole('button', { name: /my profile/i });
  expect(buttonElement).toBeInTheDocument();
})

test('renders Gator image', () => {
  render(
    <MemoryRouter>  {/* ✅ Wrap component in MemoryRouter */}
      <HomePage />
    </MemoryRouter>
  );

  const imageElement = screen.getByAltText(/gator/i);
  expect(imageElement).toBeInTheDocument();
})

test('renders POSTS button', () => {
  render(
    <MemoryRouter>  {/* ✅ Wrap component in MemoryRouter */}
      <HomePage />
    </MemoryRouter>
  );

  const buttonElement = screen.getByRole('button', { name: /posts/i });
  expect(buttonElement).toBeInTheDocument();
})

// test('clicking on START BLOGGING button navigates to /login', () => {
//   render(
//     <MemoryRouter>  {/* ✅ Wrap component in MemoryRouter */}
//       <HomePage />
//     </MemoryRouter>
//   );

//   const buttonElement = screen.getByRole('button', { name: /start blogging/i });
//   buttonElement.click();

//   expect(screen.getByText(/login/i)).toBeInTheDocument();
// })






;

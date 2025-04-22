import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Components
import HomePage from './components/Home/HomePage';
import ProfilePage from './components/Profile/ProfilePage';
import NewPost from './components/NewPost/NewPost';
import PostDetail from './components/Posts/PostDetail';
import EditPost from './components/EditPost/EditPost';
import Dashboard from './components/Dashboard/DashboardPage';

// Mocks
import { useAuth } from './contexts/AuthContext';
import blogService from './utils/blogService';

jest.mock('./contexts/AuthContext');
jest.mock('./utils/blogService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1', postId: '1' }),
  };
});

const mockUser = {
  username: 'TestGator',
  email: 'testgator@ufl.edu',
  profileImage: null,
};

beforeEach(() => {
  useAuth.mockReturnValue({ user: mockUser });
});

describe('HomePage Unit Tests', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  });

  test('renders START BLOGGING button', () => {
    expect(screen.getByRole('button', { name: /start blogging/i })).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /posts/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my profile/i })).toBeInTheDocument();
  });

  test('renders Gator mascot image', () => {
    expect(screen.getByAltText(/gator/i)).toBeInTheDocument();
  });

  test('renders hero section and tips', () => {
    expect(screen.getByText(/writing your first blog/i)).toBeInTheDocument();
    expect(screen.getByText(/pick a topic you love/i)).toBeInTheDocument();
  });

  test('clicking START BLOGGING button works', async () => {
    const btn = screen.getByRole('button', { name: /start blogging/i });
    await userEvent.click(btn);
    expect(btn).toBeEnabled();
  });

});

describe('ProfilePage Unit Tests', () => {
  beforeEach(async () => {
    blogService.getAllBlogs.mockResolvedValue({
      blogs: [{ ID: 1, Title: 'Test Post', Post: '<p>Sample Content</p>', created_at: new Date().toISOString() }],
    });

    await waitFor(() =>
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    );
  });

  test('renders username and email info', () => {
    expect(screen.getByText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/email id/i)).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('TestGator'))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('testgator@ufl.edu'))).toBeInTheDocument();
  });

  test('renders post title from blogService', async () => {
    await waitFor(() => {
      expect(screen.getByText(/test post/i)).toBeInTheDocument();
    });
  });

  test('navigates when Edit button is clicked', async () => {
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/edit-post/1');
    });
  });

  test('navigates when View button is clicked', async () => {
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /^view$/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/post/1');
    });
  });

  test('triggers delete confirmation when Delete is clicked', async () => {
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
      expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
    });
  });

  test('has profile image upload button visible', () => {
    const profileButtons = screen.getAllByRole('button', { name: /profile/i });
    expect(profileButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('shows MY POSTS section heading', async () => {
    await waitFor(() => {
      expect(screen.getByText(/my posts/i)).toBeInTheDocument();
    });
  });

  test('contains NEW POST button on bottom of profile page', () => {
    expect(screen.getByRole('button', { name: /new post/i })).toBeInTheDocument();
  });
});

describe('NewPost Unit Tests', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');
    render(
      <MemoryRouter>
        <NewPost />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders title input and editor', () => {
    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders editor toolbar buttons', () => {
    ['bold', 'italic', 'underline', 'bullet list', 'numbered list', 'insert link', 'insert image'].forEach(label => {
      expect(screen.getByTitle(new RegExp(label, 'i'))).toBeInTheDocument();
    });
  });

  test('allows typing a title', async () => {
    const titleInput = screen.getByPlaceholderText(/title/i);
    await userEvent.type(titleInput, 'My First Gator Blog');
    expect(titleInput).toHaveValue('My First Gator Blog');
  });

  test('renders POST button', () => {
    expect(screen.getByRole('button', { name: /^post$/i })).toBeInTheDocument();
  });

  test('renders navbar links', () => {
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /posts/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my profile/i })).toBeInTheDocument();
  });

  test('has insert image toolbar button', () => {
    expect(screen.getByTitle(/insert image/i)).toBeInTheDocument();
  });

});

describe('PostDetail Unit Tests', () => {
  beforeEach(() => {
    blogService.getAllBlogs.mockResolvedValue({
      blogs: [{ ID: 1, Title: 'Test Post', Post: '<p>This is a test post.</p>', created_at: new Date().toISOString() }],
    });

    render(
      <MemoryRouter>
        <PostDetail />
      </MemoryRouter>
    );
  });

  test('renders loading text or fallback UI', () => {
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows post navigation buttons', async () => {
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /posts/i })).toHaveLength(2);
    });
  });

});

describe('Dashboard Unit Tests', () => {
  beforeEach(() => {
    blogService.getAllBlogs.mockResolvedValue({
      blogs: [{ ID: 1, Title: 'Dashboard Post', Post: 'A community post', created_at: new Date().toISOString() }],
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  });

  test('renders greeting with username', async () => {
    await waitFor(() => {
      expect(screen.getByText(/community feed/i)).toBeInTheDocument();
      expect(screen.getByText((text) => text.includes('Explore'))).toBeInTheDocument();
    });
  });

  test('has navigation links/buttons', async () => {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new post/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /my profile/i })).toBeInTheDocument();
    });
  });

  test('shows post content preview', async () => {
    await waitFor(() => {
      expect(screen.getByText(/community post/i)).toBeInTheDocument();
    });
  });

  test('displays dashboard post title correctly', async () => {
    await waitFor(() => {
      expect(screen.getByText(/dashboard post/i)).toBeInTheDocument();
    });
  });
});

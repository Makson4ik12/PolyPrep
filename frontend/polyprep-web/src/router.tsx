import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import MainPage from './pages/MainPage';
import EditPostPage from './pages/EditPostPage';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import UserPage from './pages/UserPage';
import NewPostPage from './pages/NewPostPage';
import ViewSharedPost from './pages/ViewSharedPost';
import SearchPage from './pages/SearchPage';
import ViewPostPage from './pages/ViewPostPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'search', element: <SearchPage /> },
      { path: 'post/edit/*', element: <EditPostPage /> },
      { path: 'post/view/*', element: <ViewPostPage /> },
      { path: 'post/shared/*', element: <ViewSharedPost /> },
      { path: 'post/new', element: <LoginPage page={<NewPostPage />} next_page="post/new" /> },
      { path: 'user', element: <LoginPage page={<UserPage />} next_page="user" /> },
      { path: '/', element: <MainPage /> },
      { path: '*', element: <ErrorPage /> }
    ],
  },
]);
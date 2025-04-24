import styles from './App.module.scss';
import 'react-responsive-modal/styles.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Header from './components/Header';
import Footer from './components/Footer';
import UserPage from './pages/UserPage';
import { LoginPage } from './pages/LoginPage';
import NewPostPage from './pages/NewPostPage';
import ViewPostPage from './pages/ViewPostPage';
import ErrorPage from './pages/ErrorPage';
import SearchPage from './pages/SearchPage';
import EditPostPage from './pages/EditPostPage';
import ScrollToTop from './utils/ScrollToTop';
import { useEffect } from 'react';
import { validateTokens } from './server-api/auth';

const App = () => {
  useEffect(() => {
      (async () => {
        await validateTokens()
        .catch((err) => console.log("non authorized"));
      }) ()
    }, []);
    
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Header />
        <ScrollToTop />
        
        <Routes>
          <Route path="/search" element={<SearchPage />} />

          <Route path="/post/edit/*" element={<EditPostPage /> } />
          <Route path="/post/view/*" element={<ViewPostPage /> } />
          <Route path="/post/new" element={<LoginPage page={<NewPostPage />} next_page="post/new" />} />

          <Route path="/user" element={<LoginPage page={<UserPage />} next_page="user" />} />

          <Route path="/" element={<MainPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

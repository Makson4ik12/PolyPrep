import styles from './App.module.scss';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Header from './components/Header';
import Footer from './components/Footer';
import UserPage from './pages/UserPage';
import { LoginPage } from './pages/LoginPage';
import NewPostPage from './pages/NewPostPage';
import ViewPostPage from './pages/ViewPostPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Header />

        <Routes>
          <Route path="/post/view/*" element={<ViewPostPage />} />

          <Route path="/post/new" element={<NewPostPage />} />
          <Route path="/post/new/test" element={<LoginPage page={<NewPostPage />} next_page="post/new" />} />

          <Route path="/user" element={<UserPage />} />
          <Route path="/user/text" element={<LoginPage page={<UserPage />} next_page="user" />} />

          <Route path="/" element={<MainPage />} />
          <Route path="*" element={<MainPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

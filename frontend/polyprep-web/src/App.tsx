import styles from './App.module.scss';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Header from './components/Header';
import Footer from './components/Footer';
import UserPage from './pages/UserPage';
import { LoginPage } from './pages/LoginPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Header />

        <Routes>
          <Route path="/user" element={<LoginPage page={<UserPage />} next_page="user" />} />
          <Route path="/" element={<MainPage />} />
          <Route path="*" element={<MainPage />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

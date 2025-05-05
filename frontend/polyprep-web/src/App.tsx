import styles from './App.module.scss';
import 'react-responsive-modal/styles.css';

import Header from './components/Header';
import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { validateTokens } from './server-api/auth';
  
const App = () => {
  useEffect(() => {
      (async () => {
        await validateTokens()
        .catch((err) => console.log("non authorized"));
      }) ()
    }, []);
    
  return (
    <div className={styles.app}>
      <Header />
      <Outlet />
      <ScrollRestoration />
    </div>
  );
}

export default App;

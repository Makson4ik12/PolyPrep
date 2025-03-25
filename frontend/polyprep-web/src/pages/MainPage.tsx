import Card from '../components/Card';
import styles from './MainPage.module.scss'
import { Link } from 'react-router-dom';

const MainPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.cards_container}>
        <Card />
        <Card />
        <Card />
      </div>
      
    </div>
  )
}

export default MainPage;
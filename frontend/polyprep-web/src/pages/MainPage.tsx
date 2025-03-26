import Card from '../components/Card';
import styles from './MainPage.module.scss'
import { Link } from 'react-router-dom';

const Section = (params: {title: string}) => {
  return (
    <div className={styles.cards_container}>
      <div className={styles.razdel}>
        <h1>{params.title}</h1>
        <div className={styles.divider}></div>
      </div>

      <Card 
        author='Макс Пупкин' 
        title='Конспекты по кмзи от Пупки Лупкиной' 
        time='25.03.2025 в 18:00'
        text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
        likes={15}
        media={null}
      />
      <Card 
        author='Макс Пупкин' 
        title='Конспекты по кмзи от Пупки Лупкиной' 
        time='25.03.2025 в 18:00'
        text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
        likes={15}
        media={null}
      />
      <Card 
        author='Макс Пупкин' 
        title='Конспекты по кмзи от Пупки Лупкиной' 
        time='25.03.2025 в 18:00'
        text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
        likes={15}
        media={null}
      />
      <Card 
        author='Макс Пупкин' 
        title='Конспекты по кмзи от Пупки Лупкиной' 
        time='25.03.2025 в 18:00'
        text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
        likes={15}
        media={null}
      />
    </div>
  );
}

const MainPage = () => {
  return (
    <div className={styles.container}>
      <Section title='Вышмат' />
      <Section title='Криптография' />
    </div>
  )
}

export default MainPage;
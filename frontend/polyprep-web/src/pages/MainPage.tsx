import Card from '../components/Card';
import styles from './MainPage.module.scss'

const MainPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.cards_container}>
        <Card 
          id={1}
          created_at={1745160699283}
          updated_at={1745160699283}
          scheduled_at={1745160699283}
          author_id={1745160699283}
          title='Конспекты по кмзи от Пупки Лупкиной' 
          text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
          public={true}
          hashtages={["#hype", "#math", "#hochy5"]}
        />
        <Card 
          id={1}
          created_at={1745160699283}
          updated_at={1745160699283}
          scheduled_at={1745160699283}
          author_id={1745160699283}
          title='Конспекты по кмзи от Пупки Лупкиной' 
          text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
          public={true}
          hashtages={["#hype", "#math", "#hochy5"]}
        />
        
      </div>
    </div>
  )
}

export default MainPage;
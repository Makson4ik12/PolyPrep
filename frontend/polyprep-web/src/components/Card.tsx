import styles from './Card.module.scss'
import { Link } from 'react-router-dom';
import IconUser from '../icons/user.svg'

const Card = () => {
  return (
    <div className={styles.container}>
      <h1>Конспекты по кмзи от Пупки Лупкиной</h1>
      <div className={styles.divider}></div>
      <p>Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно</p>
      <div className={styles.divider}></div>

      <div className={styles.bottom}>
        <img src={IconUser} alt='user'></img>
        <p>Автор: <b>Макс Пупкин</b> | 25.03.2025 в 18:00</p>
      </div>
    </div>
  )
}

export default Card;
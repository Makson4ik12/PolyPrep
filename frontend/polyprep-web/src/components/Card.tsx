import styles from './Card.module.scss'
import { Link } from 'react-router-dom';
import IconUser from '../icons/user.svg'
import IconLike from '../icons/like.svg'
import IconShare from '../icons/share.svg'
import IconFavourite from '../icons/favourite.svg'
import IconComments from '../icons/comments.svg'

interface IUserData {
  author: string;
  time: string;
  title: string;
  text: string;
  media: [] | null;
  likes: number;
}

const Card = (data: IUserData) => {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.lin_container}>
          <img src={IconUser} alt='user' className={styles.user_icon}></img>
          <p><b>Макс Пупкин</b> | 25.03.2025 в 18:00</p>
        </div>
      
        <img src={IconFavourite} className={styles.btns} alt='favourite'></img>
      </div>

      <h1>Конспекты по кмзи от Пупки Лупкиной</h1>
      <div className={styles.divider}></div>
      <p>RTK Query is built on top of the Redux Toolkit core for its implementation, using Redux internally for its architecture. Although knowledge of Redux and RTK are not required to use RTK Query, you should explore all of the additional global store management capabilities they provide, as well as installing the Redux DevTools browser extension, which works flawlessly with RTK Query to traverse and replay a timeline of your request & cache behavior. RTK Query is built on top of the Redux Toolkit core for its implementation, using Redux internally for its architecture. Although knowledge of Redux and RTK are not required to use RTK Query, you should explore all of the additional global store management capabilities they provide, as well as installing the Redux DevTools browser extension, which works flawlessly with RTK Query to traverse and replay a timeline of your request & cache behavior. RTK Query is built on top of the Redux Toolkit core for its implementation, using Redux internally for its architecture. Although knowledge of Redux and RTK are not required to use RTK Query, you should explore all of the additional global store management capabilities they provide, as well as installing the Redux DevTools browser extension, which works flawlessly with RTK Query to traverse and replay a timeline of your request & cache behavior.</p>
      <div className={styles.divider}></div>

      <div className={styles.bottom}>
        <div className={styles.lin_container}>
          <div className={styles.likes}>
            <p>{data.likes}</p>
            <img src={IconLike} className={styles.like_btn} alt='like'></img>
          </div>
          <p>|</p>
          <img src={IconComments} className={styles.btns} alt='comments'></img>
        </div>

        
        <img src={IconShare} className={styles.btns} alt='share'></img>
        
      </div>
    </div>
  )
}

export default Card;
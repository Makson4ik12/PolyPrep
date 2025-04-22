import styles from './Card.module.scss'
import { Link, useNavigate } from 'react-router-dom';
import IconUser from '../icons/user.svg'
import IconUnlike from '../icons/unlike.svg'
import IconShare from '../icons/share.svg'
import IconFavourite from '../icons/favourite.svg'
import IconComments from '../icons/comments.svg'
import { getDate } from '../utils/UtilFunctions';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import { Badge } from './Badge';
import { IPost } from '../server-api/posts';

const Card = (data: IPost) => {
  const navigate = useNavigate();
  const screenSize = HandleResponsiveView();

  return (
    <div className={styles.container} onClick={() => navigate('/post/view/' + data.id)}>
      <div className={styles.top}>
        <div className={styles.lin_container}>
          <img src={IconUser} alt='user' className={styles.user_icon}></img>
          {
            screenSize.width > screenSizes.__1200.width ?
              <p><b>Макс Пупкин</b> | { data.created_at ? getDate(data.created_at) : "null" }</p>
            :
              <p><b>Макс Пупкин</b><br></br>{ data.created_at ? getDate(data.created_at) : "null" }</p>
          }
          
        </div>
      
        <img src={IconFavourite} className={styles.btns} alt='favourite'></img>
      </div>

      <div className={styles.lin_container}>
        <Badge text='#хочу5'/>
        <Badge text='#math'/>
        <Badge text='#криптография'/>
      </div>

      <h1>{data.title}</h1>
    
      <p>{data.text}</p>
      
      <div className={styles.bottom}>
        <div className={styles.lin_container}>
          <div className={styles.likes}>
            <p>1</p>
            <img src={IconUnlike} className={styles.like_btn} alt='like'></img>
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
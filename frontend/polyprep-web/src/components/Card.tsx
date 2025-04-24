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
import store from '../redux-store/store';
import { deleteLike, getPostLikes, ILike, ILikes, postLike } from '../server-api/likes';
import { useEffect, useState } from 'react';
import Loader, { MiniLoader } from './Loader';

const Card = (data: IPost) => {
  const navigate = useNavigate();
  const screenSize = HandleResponsiveView();
  const userData = store.getState().auth.userData;

  const [likes, setLikes] = useState<ILikes>();
  const [userLike, setUserLike] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdate, updateComponent] = useState<boolean>(false);
  
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      await getPostLikes(data.id || -1)
      .then((resp) => {
        setLikes(resp as ILikes);
        setUserLike(((resp as ILikes).likes).some(item => item.user_id === userData.uid));
      })
      .catch((error) => console.log("cannot load post likes"));

      setIsLoading(false);
    }) ()
  }, [isUpdate]);

  const handleOnClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    if (userLike) {
      await deleteLike(likes?.likes.find(item => item.user_id === userData.uid)?.id || -1)
      .then((resp) => {
        setUserLike(false);
        updateComponent(prev => !prev);
      })
      .catch((error) => console.log("cannot dislike post"));
    } else {
      await postLike(data.id || -1)
      .then((resp) => {
        setUserLike(true);
        updateComponent(prev => !prev);
      })
      .catch((error) => console.log("cannot like post"));
    }
  }

  return (
    <div className={styles.container} onClick={() => navigate('/post/view/' + data.id)}>
      <div className={styles.top}>
        <div className={styles.lin_container}>
          <img src={IconUser} alt='user' className={styles.user_icon}></img>
          {
            screenSize.width > screenSizes.__1200.width ?
              <p><b>{ data.author_id === userData.uid ? "You" : "SomeUser" }</b> | { data.created_at ? getDate(data.created_at) : "null" }</p>
            :
              <p><b>{ data.author_id === userData.uid ? "You" : "SomeUser" }</b><br></br>{ data.created_at ? getDate(data.created_at) : "null" }</p>
          }
          
        </div>
      
        <img src={IconFavourite} className={styles.btns} alt='favourite'></img>
      </div>

      <div className={styles.lin_container}>
        {
          data.hashtages.map((item) => 
            <Badge text={item} key={item}/>
          )
        }
      </div>

      <h1>{data.title}</h1>
    
      <p>{data.text}</p>
      
      <div className={styles.bottom}>
        <div className={styles.lin_container}>
          {
            isLoading ? <MiniLoader/>
              :
            <>
              <div className={ userLike ? styles.likes_liked : styles.likes} onClick={(e) => handleOnClick(e)}                >
                <p>{ likes?.count }</p>
                <img src={IconUnlike} className={styles.like_btn} alt='like'></img>
              </div>
              <p>|</p>
              
              <img src={IconComments} className={styles.btns} alt='comments'></img>
            </>
          }
          
        </div>
        
        <img src={IconShare} className={styles.btns} alt='share'></img>
        
      </div>
    </div>
  )
}

export default Card;
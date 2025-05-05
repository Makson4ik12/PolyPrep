import styles from './Card.module.scss'

import store from '../redux-store/store';
import SharePost from './modals/SharePost';
import Modal from 'react-responsive-modal';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ViewUserProfile from './modals/ViewUserProfile';
import { useNavigate } from 'react-router-dom';
import { getDate } from '../utils/UtilFunctions';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import { Badge } from './Badge';
import { IPost } from '../server-api/posts';
import { deleteLike, getPostLikes, ILikes, postLike } from '../server-api/likes';
import { useEffect, useState } from 'react';
import { getPostComments, IComment } from '../server-api/comments';
import { checkPostIsFavourite, deleteFavourite, postFavourite } from '../server-api/favourites';
import { IUser } from '../server-api/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserData } from './Header';
import { MiniLoader } from './Loader';

import IconUser from '../icons/user.svg'
import IconUnlike from '../icons/unlike.svg'
import IconShare from '../icons/share.svg'
import IconFavourite from '../icons/favourite.svg'
import IconFavouriteFilled from '../icons/favourite_fill.svg'
import IconComments from '../icons/comments.svg'
import IconPrivate from '../icons/private.svg'

const Card = (data: IPost) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const screenSize = HandleResponsiveView();
  const userData = store.getState().auth.userData;

  const [viewShare, setViewShare] = useState<boolean>(false);
  const [viewUserProfile, setViewUserProfile] = useState<boolean>(false);
  const [likes, setLikes] = useState<ILikes>();
  const [comments, setComments] = useState<number>(0);
  const [userLike, setUserLike] = useState(false);
  const [isUpdate, updateComponent] = useState<boolean>(false);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-' + data.author_id + '-image'],
    queryFn: () => fetchUserData(data.author_id || "-1"),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    (async () => {
      await getPostLikes(data.id || -1)
      .then((resp) => {
        setLikes(resp as ILikes);
        setUserLike(((resp as ILikes).likes).some(item => item.user_id === userData.uid));
      })
      .catch((error) => console.log("cannot load post likes"));
    }) ()
  }, [isUpdate]);

  useEffect(() => {
    (async () => {
      await getPostComments(data.id || -1)
      .then((resp) => {
        setComments((resp as IComment[]).length);
      })
      .catch((error) => console.log("cannot load post comments"));
    }) ()
  }, []);

  useEffect(() => {
    (async () => {
      await checkPostIsFavourite(data.id || -1)
      .then((resp) => {
        setIsFavourite(true);
      })
      .catch((error) => console.log("not favorite"));
    }) ()
  }, []);

  const handleLike = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

  const handleFavourite = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavourite) {
      await deleteFavourite(data.id || -1)
      .then((resp) => {
        setIsFavourite(false);
      })
      .catch((error) => console.log("cannot delete favourite post"));
    } else {
      await postFavourite(data.id || -1)
      .then((resp) => {
        setIsFavourite(true);
      })
      .catch((error) => console.log("cannot favourite post"));
    }

    await queryClient.invalidateQueries({ queryKey: ['userpage-favouritePosts'] });
  }

  const handleShareLink = async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    setViewShare(true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.user_info} onClick={() => setViewUserProfile(true)}>
          {
            isLoadingUser ? <MiniLoader />
            :
              <>
                <img src={(((user as IUser).img_link != "") ? (user as IUser).img_link: IconUser)} alt='user' className={styles.user_icon}></img>
              </>
          }
          {
            screenSize.width > screenSizes.__1200.width ?
              <p><b>{ data.author_id === userData.uid ? "You" : user?.username }</b> | { data.created_at ? getDate(data.created_at) : "null" }</p>
            :
              <p><b>{ data.author_id === userData.uid ? "You" : user?.username }</b><br></br>{ data.created_at ? getDate(data.created_at) : "null" }</p>
          }

          { 
            !data?.public ? <img src={IconPrivate} className={styles.private_icon} alt='private'/> : <></>
          }
        </div>
      
        <img src={ isFavourite ? IconFavouriteFilled : IconFavourite } className={styles.btns} alt='favourite' onClick={(e) => handleFavourite(e)}></img>
      </div>

      <div className={styles.lin_container}>
        {
          data.hashtages.map((item) => 
            <Badge text={item} key={item}/>
          )
        }
      </div>
      
      <div className={styles.card_main_content} onClick={() => navigate('/post/view/' + data.id)}>
        <h1 className={styles.post_title}>{data.title}</h1>
        <Markdown remarkPlugins={[remarkGfm]}>{data.text}</Markdown>
      </div>
      
      <div className={styles.bottom}>
        <div className={styles.lin_container}>
          <div className={ userLike ? styles.likes_liked : styles.likes} onClick={(e) => handleLike(e)}>
            <p>{ likes?.count }</p>
            <img src={IconUnlike} className={styles.like_btn} alt='like'></img>
          </div>
          <p>|</p>
          
          <div className={styles.comments} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/post/view/' + data.id + "#comments");
          }}>
            <p>{ comments }</p>
            <img src={IconComments} className={styles.like_btn} alt='comments'></img>
          </div>
          
        </div>
        
        <img src={IconShare} className={styles.btns} alt='share' onClick={(e) => handleShareLink(e)}></img>
      </div>

      <Modal 
        open={viewShare} 
        onClose={() => setViewShare(false)} 
        showCloseIcon={false} 
        animationDuration={400}
        blockScroll={true}
        center
      >
        <SharePost 
          id={data.id}
          created_at={data.created_at}
          updated_at={data.updated_at}
          scheduled_at={data.scheduled_at}
          author_id={data.author_id}
          title={data.title} 
          text={data.text}
          public={data.public}
          hashtages={data.hashtages}
          onClose={() => setViewShare(false)}
        />
      </Modal>

      <Modal 
        open={viewUserProfile} 
        onClose={() => setViewUserProfile(false)} 
        showCloseIcon={true} 
        animationDuration={400}
        blockScroll={true}
        center
      >
        <ViewUserProfile 
          id={user?.id || "-1"}
          username={user?.username|| "-1"}
          img_link={user?.img_link|| ""}
          onClose={() => setViewUserProfile(false)}
        />
      </Modal>
    </div>
  )
}

export default Card;
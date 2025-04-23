import styles from './ViewPostPage.module.scss'
import { useEffect, useState } from 'react';
import IconDoc from '../icons/doc.svg'
import IconImage from '../icons/image.svg'
import IconAudio from '../icons/audio.svg'
import IconUser from '../icons/user.svg'
import IconPrivate from '../icons/private.svg'
import IconPublic from '../icons/public.svg'
import { useLocation, useNavigate } from 'react-router-dom';
import { IComment } from '../server-api/comments';
import { getDate } from '../utils/UtilFunctions';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import IconDownload from '../icons/download.svg'
import IconSend from '../icons/send.svg'
import IconShare from '../icons/share.svg'
import IconFavourite from '../icons/favourite.svg'
import IconEdit from '../icons/edit.svg'
import IconContextMenu from '../icons/context_menu.svg'
import { Badge } from '../components/Badge';
import IconUnlike from '../icons/unlike.svg'
import { getPost, IPost } from '../server-api/posts';
import store from '../redux-store/store';
import Loader from '../components/Loader';

interface IInclude {
  name: string;
}

const Include = (data: IInclude) => {
  return (
    <div className={styles.include}>
      <div className={styles.lin_container}>
        <img src={
          (data.name.endsWith(".png") || data.name.endsWith(".jpg")) ? IconImage : data.name.endsWith(".mp3") ? IconAudio : IconDoc
        } alt='inlude' />
        <p>{data.name}</p>
      </div>
      <img src={IconDownload} alt='download' className={styles.action_btn}/>
    </div>
  )
}

const Comment = (data: IComment) => {
  return (
    <div className={styles.info_container}>
      <div className={styles.top_info}>
        <div className={styles.lin_container}>
          <img src={IconUser} alt='usericon'/>
          <p><b>Maks Pupkin</b> | { getDate(data.created_at) }</p>
        </div>

        <div className={styles.lin_container}>
          <img src={IconEdit} alt='edit' className={styles.action_btn}/>
        </div>
      </div>

      <p className={styles.text}>{data.text}</p>
    </div>
  )
}

const ViewPostPage = () => {
  const location = useLocation();
  const post_id = Number(location.pathname.slice(location.pathname.lastIndexOf('/') + 1, location.pathname.length) || -1);
  const userData = store.getState().auth.userData;

  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postData, setPostData] = useState<IPost>();

  const [viewIncludes, setViewIncludes] = useState(false);
  const navigate = useNavigate();
  const screenSize = HandleResponsiveView();

  useEffect(() => {
    (async () => {
      setIsLoadingPost(true);

      await getPost(post_id)
      .then((resp) => {
        setPostData(resp as IPost);
      })
      .catch((error) => console.log("cannot load post"));

      setIsLoadingPost(false);
    }) ()
  }, []);

  return (
    <div className={styles.container}>
      {
        isLoadingPost ? <Loader />
        :
          <div className={styles.main_content}>
            <div className={styles.top_info}>
              <div className={styles.lin_container}>
                <img src={IconUser} alt='usericon'/>
                <p><b>{ postData?.author_id === userData.uid ? "You" : "SomeUser" }</b> | { getDate(postData?.created_at || 0) }</p>

                <div className={styles.badge}>
                  {
                    postData?.public ?
                    <>
                      <img src={IconPrivate} alt='private'/>
                      <p>Private</p>
                    </>
                    :
                    <>
                      <img src={IconPublic} alt='public'/>
                      <p>Public</p>
                    </>
                  }
                  
                </div>
              </div>
              
              <div className={styles.lin_container}>
                {
                  screenSize.width > screenSizes.__768.width ?
                    <>
                      <img src={IconFavourite} className={styles.action_btn} alt='favourite'/>
                      <img src={IconShare} className={styles.action_btn} alt='share'/>
                      <p>|</p>
                      <img src={IconEdit} className={styles.action_btn} alt='edit' onClick={() => navigate("/post/edit/" + postData?.id)}/>
                    </>
                  :
                  <div className={styles.dropdown}>
                    <img src={IconContextMenu} className={styles.action_btn} alt='context_menu'/>

                    <div className={styles.dropdown_content}>
                      <button className={styles.action_item}>
                        <img src={IconFavourite} className={styles.action_btn} alt='favourite'/>
                        <p>В избранное</p>
                      </button>

                      <button className={styles.action_item}>
                      <img src={IconShare} className={styles.action_btn} alt='share'/>
                        <p>Поделиться</p>
                      </button>
                      
                      {
                        postData?.author_id === userData.uid ?
                          <>
                            <div className={styles.divider} />

                            <button className={styles.action_item}>
                              <img src={IconEdit} className={styles.action_btn} alt='edit' onClick={() => navigate("/post/edit")}/>
                              <p>Редактировать</p>
                            </button>
                          </>
                        :
                          <></>
                      }
                      
                    </div>
                  </div> 
                    
                }
              </div>
              
            </div>
            
            <h2 className={styles.title}>{ postData?.title }</h2>

            <p className={styles.text}>{ postData?.text }</p>
            
            <div className={styles.lin_container}>
              {
                postData?.hashtages.map((item) => 
                  <Badge text={item}/>
                )
              }
            </div>
            
            <div className={styles.divider} />

            <div className={styles.lin_container}>
              <div className={styles.likes}>
                <p>1</p>
                <img src={IconUnlike} className={styles.like_btn} alt='like'></img>
              </div>
            </div>
          </div>
      }

      <div className={styles.title_razdel} onClick={() => setViewIncludes(prev => !prev)}>
        <h2>Вложения</h2>
        <img src={!viewIncludes ? IconArrowDown : IconArrowUp} alt='arrow' />
      </div>

      <div className={viewIncludes ? styles.includes_container : styles.includes_container_hidden}>
        <Include name='text.pdf' />
        <Include name='myrecords.mp3' />
        <Include name='photo-2002020.png' />
      </div>

      <h2>Комментарии</h2>

      <div className={styles.includes_container}>
        <form>
          <input 
            name='comment' 
            type='text' 
            placeholder='Крутой конспект!' 
            maxLength={350}
            required>
          </input>

          <button type='submit'>
            <img src={IconSend} alt='send' />
          </button>
        </form>
        
        <div className={styles.divider} />

        <Comment id={1} created_at={1745160699283} updated_at={1745160699283} author_id={1} post_id={1} text='Апупенный конспект ставлю лике однозначно!' />
        <Comment id={1} created_at={1745160699283} updated_at={1745160699283} author_id={1} post_id={1} text='Конспект кал собачий...' />
        <Comment id={1} created_at={1745160699283} updated_at={1745160699283} author_id={1} post_id={1} text='Апупенный конспект ставлю лике однозначно!' />
      </div>
    </div>
  )
}

export default ViewPostPage;
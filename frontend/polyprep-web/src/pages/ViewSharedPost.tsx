import styles from './ViewPostPage.module.scss'
import store from '../redux-store/store';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSharedPost, IPost } from '../server-api/posts';
import { getDate } from '../utils/UtilFunctions';
import IconDoc from '../icons/doc.svg'
import IconImage from '../icons/image.svg'
import IconAudio from '../icons/audio.svg'
import IconUser from '../icons/user.svg'
import IconPrivate from '../icons/private.svg'
import IconPublic from '../icons/public.svg'
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import IconDownload from '../icons/download.svg'
import { Badge } from '../components/Badge';
import Loader, { MiniLoader } from '../components/Loader';
import { getUser, IUser } from '../server-api/user';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQuery } from '@tanstack/react-query';
import { fetchUserData } from '../components/Header';

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

const ViewSharedPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const post_id = location.pathname.slice(location.pathname.lastIndexOf('/') + 1, location.pathname.length);
  const userData = store.getState().auth.userData;

  const [postData, setPostData] = useState<IPost>();

  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [viewIncludes, setViewIncludes] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoadingPost(true);

      await getSharedPost(post_id)
      .then((resp) => {
        setPostData(resp as IPost);
      })
      .catch((err) => navigate("/error"))

      setIsLoadingPost(false);
    }) ()
  }, []);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-' + postData?.author_id + '-image'],
    queryFn: () => fetchUserData(postData?.author_id || "-1"),
    staleTime: 5 * 60 * 1000,
    enabled: !!postData?.author_id
  });

  return (
    <div className={styles.container}>
      {
        isLoadingPost ? <Loader />
        :
          <div className={styles.main_content}>
            <div className={styles.top_info}>
              <div className={styles.lin_container}>
                {
                  isLoadingUser ? <MiniLoader />
                  :
                    <>
                      <img className={styles.user_icon} src={(((user as IUser).img_link != "") ? (user as IUser).img_link : IconUser)} alt='usericon'/>
                    </>
                }
                
                <p><b>{ postData?.author_id === userData.uid ? "You" : user?.username }</b> | { getDate(postData?.created_at || 0) }</p>

                <div className={styles.badge}>
                  {
                    !postData?.public ?
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
              
            </div>
            
            <h2 className={styles.title}>{ postData?.title }</h2>
            
            <div className={styles.md_wrapper}>
              <Markdown remarkPlugins={[remarkGfm]}>{ postData?.text }</Markdown>
            </div>
            
            <div className={styles.lin_container}>
              {
                postData?.hashtages.map((item) => 
                  <Badge text={item} key={item}/>
                )
              }
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
    </div>
  )
}

export default ViewSharedPost;
import styles from './ViewPostPage.module.scss'

import store from '../redux-store/store';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getDate } from '../utils/UtilFunctions';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSharedPost, IPost } from '../server-api/posts';
import { Badge } from '../components/Badge';
import Loader, { MiniLoader } from '../components/Loader';
import { IUser } from '../server-api/user';
import { useQuery } from '@tanstack/react-query';
import { fetchUserData } from '../components/Header';
import { getSharedIncludes, IInclude } from '../server-api/includes';
import { ViewPostInclude } from '../components/Include';

import IconUser from '../icons/user.svg'
import IconPrivate from '../icons/private.svg'
import IconPublic from '../icons/public.svg'
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'

const ViewSharedPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const post_id = location.pathname.slice(location.pathname.lastIndexOf('/') + 1, location.pathname.length);
  const userData = store.getState().auth.userData;

  const [postData, setPostData] = useState<IPost>();
  const [includes, setPostIncludes] = useState<IInclude[]>([]);

  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingIncludes, setIsLoadingIncludes] = useState(false);
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

  useEffect(() => {
    (async () => {
      setIsLoadingIncludes(true);

      await getSharedIncludes(post_id)
      .then((resp) => {
        setPostIncludes(resp as IInclude[]);
      })
      .catch((error) => console.log("cannot load post includes"));

      setIsLoadingIncludes(false);
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
                  isLoadingUser || !user ? <MiniLoader />
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

      { 
        isLoadingIncludes ?
          <>
            <div className={styles.title_razdel} onClick={() => setViewIncludes(prev => !prev)}>
              <h2>Вложения</h2>
            </div>

            <Loader />
          </>
        :
          includes?.length === 0 ? 
            <></>
          :
            <>
              <div className={styles.title_razdel} onClick={() => setViewIncludes(prev => !prev)}>
                <h2>Вложения</h2>
                <img src={!viewIncludes ? IconArrowDown : IconArrowUp} alt='arrow' />
              </div>

              <div className={viewIncludes ? styles.includes_container : styles.includes_container_hidden}>
                {
                  includes?.map((item) => 
                    <ViewPostInclude 
                      key={item.id}
                      link={item.link} 
                      id={item.id} 
                      filename={item.filename} 
                      size={item.size}
                    />
                  )
                }
              </div>
            </>
      }
    </div>
  )
}

export default ViewSharedPost;
import styles from './ViewPostPage.module.scss'

import store from '../redux-store/store';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import Comment from '../components/Comment';
import Modal from 'react-responsive-modal';
import SharePost from '../components/modals/SharePost';
import ViewUserProfile from '../components/modals/ViewUserProfile';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getPostComments, IComment, postComment } from '../server-api/comments';
import { deleteLike, getPostLikes, ILikes, postLike } from '../server-api/likes';
import { checkPostIsFavourite, deleteFavourite, postFavourite } from '../server-api/favourites';
import { deletePost, getPost, IPost } from '../server-api/posts';
import { getDate } from '../utils/UtilFunctions';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import { Badge } from '../components/Badge';
import Loader, { MiniLoader } from '../components/Loader';
import { IUser } from '../server-api/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserData } from '../components/Header';
import { ViewPostInclude } from '../components/Include';
import { getPostIncludes, IInclude } from '../server-api/includes';

import IconUser from '../icons/user.svg'
import IconPrivate from '../icons/private.svg'
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import IconDelete from '../icons/trash.svg'
import IconSend from '../icons/send.svg'
import IconShare from '../icons/share.svg'
import IconFavourite from '../icons/favourite.svg'
import IconFavouriteFilled from '../icons/favourite_fill.svg'
import IconEdit from '../icons/edit.svg'
import IconContextMenu from '../icons/context_menu.svg'
import IconUnlike from '../icons/unlike.svg'

const fetchPost = async (post_id: number) => {
  const resp = await getPost(post_id);

  return resp as IPost;
};

const ViewPostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const post_id = Number(location.pathname.slice(location.pathname.lastIndexOf('/') + 1, location.pathname.length) || -1);
  const userData = store.getState().auth.userData;

  const [postComments, setPostComments] = useState<IComment[]>();
  const [userLike, setUserLike] = useState(false);
  const [likes, setLikes] = useState<ILikes>();
  const [includes, setPostIncludes] = useState<IInclude[]>([]);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [viewShare, setViewShare] = useState<boolean>(false);
  const [viewIncludes, setViewIncludes] = useState(false);
  const [viewUserProfile, setViewUserProfile] = useState<boolean>(false);

  const [isUpdate, updateComponent] = useState<boolean>(false);
  const [isUpdateComments, updateComments] = useState<boolean>(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isLoadingIncludes, setIsLoadingIncludes] = useState(true);

  const screenSize = HandleResponsiveView();
  const commentRef = useRef<HTMLTextAreaElement>(null);

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
      await postLike(postData?.id || -1)
      .then((resp) => {
        setUserLike(true);
        updateComponent(prev => !prev);
      })
      .catch((error) => console.log("cannot like post"));
    }
  }

  const handleOnSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      const formElements = e.currentTarget.elements as typeof e.currentTarget.elements & {
        comment: HTMLTextAreaElement
      };
  
      setIsLoadingComments(true);
  
      await postComment({
        text: formElements.comment.value,
        post_id: postData?.id || -1
      })
      .then ((resp) => {
        setIsLoadingComments(false);
        updateComments(prev => !prev);
        commentRef.current ? commentRef.current.value = "" : console.log("null comment ref");
      })
      .catch((error) => { 
        setIsLoadingComments(false);
        console.log("comment not created");
      });
  }

  const handleFavourite = async (e: React.MouseEvent<HTMLImageElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
  
      if (isFavourite) {
        await deleteFavourite(postData?.id || -1)
        .then((resp) => {
          setIsFavourite(false);
        })
        .catch((error) => console.log("cannot delete favourite post"));
      } else {
        await postFavourite(postData?.id || -1)
        .then((resp) => {
          setIsFavourite(true);
        })
        .catch((error) => console.log("cannot favourite post"));
      }
  }

  const handleDelete = async (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    await deletePost(post_id)
      .then((resp) => {
        navigate("/user");
      })
      .catch((error) => console.log("cannot delete post"));
    
    await queryClient.invalidateQueries({ queryKey: ['userpage-userPosts'] });
    await queryClient.invalidateQueries({ queryKey: ['userpage-favouritePosts'] });
  }

  const { data: postData, isLoading: isLoadingPost, error: errLoadPost } = useQuery({
    queryKey: ['viewpostpage-id' + post_id],
    queryFn: () => fetchPost(post_id),
    staleTime: 5 * 60 * 1000,
  });

  const { data: user, isLoading: isLoadingUser, error: errLoadUser } = useQuery({
    queryKey: ['user-' + postData?.author_id + '-image'],
    queryFn: () => fetchUserData(postData?.author_id || "-1"),
    staleTime: 5 * 60 * 1000,
    enabled: !!postData?.author_id
  });

  useEffect(() => {
    (async () => {
      await checkPostIsFavourite(post_id)
      .then((resp) => {
        setIsFavourite(true);
      })
      .catch((error) => console.log("not favorite"));
    }) ()
  }, []);
    
  useEffect(() => {
    (async () => {
      setIsLoadingComments(true);

      await getPostComments(post_id)
      .then((resp) => {
        setPostComments(resp as IComment[]);
      })
      .catch((error) => console.log("cannot load post comments"));

      setIsLoadingComments(false);
    }) ()
  }, [isUpdateComments]);

  useEffect(() => {
    (async () => {
      await getPostLikes(post_id)
      .then((resp) => {
        setLikes(resp as ILikes);
        setUserLike(((resp as ILikes).likes).some(item => item.user_id === userData.uid));
      })
      .catch((error) => console.log("cannot load post likes"));
    }) ()
  }, [isUpdate]);

  useEffect(() => {
    (async () => {
      setIsLoadingIncludes(true);

      await getPostIncludes(post_id)
      .then((resp) => {
        setPostIncludes(resp as IInclude[]);
      })
      .catch((error) => console.log("cannot load post includes"));

      setIsLoadingIncludes(false);
    }) ()
  }, []);

  useEffect(() => {
      if (location.hash) {
        const element = document.getElementById(location.hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, [location, isLoadingComments]);

  return (
    <div className={styles.container}>
      {
        isLoadingPost ? <Loader />
        :
          errLoadPost ? <Navigate to="/error" replace={true}/>
          :
          <div className={styles.main_content}>
            <div className={styles.top_info}>
              <div className={styles.user_info} onClick={() => setViewUserProfile(true)}>
                {
                  isLoadingUser ? <MiniLoader />
                  :
                    <>
                      <img className={styles.user_icon} src={(((user as IUser).img_link != "") ? (user as IUser).img_link : IconUser)} alt='usericon'/>
                    </>
                }
                {
                  screenSize.width > screenSizes.__1200.width ?
                    <p><b>{ postData?.author_id === userData.uid ? "You" : user?.username }</b> | { getDate(postData?.created_at || 0) }</p>
                  :
                    <p><b>{ postData?.author_id === userData.uid ? "You" : user?.username }</b><br></br>{ getDate(postData?.created_at || 0) }</p>
                }
                
                {
                  !postData?.public ?
                    <div className={styles.badge}>
                      <img src={IconPrivate} alt='private'/>
                      <p>Private</p>
                    </div>
                  :
                    <></>
                }
              </div>
              
              <div className={styles.lin_container}>
                {
                  screenSize.width > screenSizes.__768.width ?
                    <>
                      <img src={ isFavourite ? IconFavouriteFilled : IconFavourite } className={styles.action_btn} alt='favourite' onClick={(e) => handleFavourite(e)}/>
                      <img src={IconShare} className={styles.action_btn} alt='share' onClick={() => setViewShare(true)}/>
                      {
                        postData?.author_id === userData.uid ?
                          <>
                            <p>|</p>
                            <img src={IconEdit} className={styles.action_btn} alt='edit' onClick={() => navigate("/post/edit/" + postData?.id)}/>
                            <img src={IconDelete} className={styles.action_btn} alt='delete' onClick={(e) => handleDelete(e)}/>
                          </>
                        :
                          <></>
                      }
                    </>
                  :
                  <div className={styles.dropdown}>
                    <img src={IconContextMenu} className={styles.action_btn} alt='context_menu'/>

                    <div className={styles.dropdown_content}>
                      <button className={styles.action_item} onClick={(e) => handleFavourite(e)}>
                        <img src={ isFavourite ? IconFavouriteFilled : IconFavourite } className={styles.action_btn} alt='favourite'/>
                        <p>В избранное</p>
                      </button>

                      <button className={styles.action_item} onClick={() => setViewShare(true)}>
                        <img src={IconShare} className={styles.action_btn} alt='share'/>
                        <p>Поделиться</p>
                      </button>
                      
                      {
                        postData?.author_id === userData.uid ?
                          <>
                            <div className={styles.divider} />

                            <button className={styles.action_item} onClick={() => navigate("/post/edit/" + postData?.id)}>
                              <img src={IconEdit} className={styles.action_btn} alt='edit'/>
                              <p>Редактировать</p>
                            </button>

                            <button className={styles.action_item} onClick={(e) => handleDelete(e)}>
                              <img src={IconDelete} className={styles.action_btn} alt='delete'/>
                              <p>Удалить</p>
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
            
            <h1 className={styles.title}>{ postData?.title }</h1>
            
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
            
            <div className={styles.divider} />

            <div className={styles.lin_container}>
              <div className={ userLike ? styles.likes_liked : styles.likes} onClick={(e) => handleLike(e)}>
                <p>{ likes?.count }</p>
                <img src={IconUnlike} className={styles.like_btn} alt='like'></img>
              </div>
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
      
      <div className={styles.title_razdel_static} id='comments'>
        <h2>Комментарии</h2>
      </div>

      <div className={styles.includes_container}>
        {
          userData.uid ? 
            <form onSubmit={handleOnSubmitComment}>
              <TextareaAutosize 
                id="comment" 
                name="comment" 
                placeholder='Крутой конспект!' 
                maxLength={350}
                required
                ref={commentRef}
                spellCheck={false}
                autoCapitalize='on'
              />

              <button type='submit'>
                <img src={IconSend} alt='send' />
              </button>
            </form>
          :
          <p className={styles.access_restricted}> <img src={IconPrivate} alt='send' />Авторизируйтесь, для того чтобы оставить новый комментарий</p>
        }
        
        <div className={styles.divider} />
          {
            isLoadingComments ?
              <Loader />
            :
              postComments?.length === 0 ? <p>Комментариев пока нет :(</p>
                :
              <>
                {
                  postComments?.map((item) => 
                    <Comment 
                      key={item.id}
                      id={item.id}
                      created_at={item.created_at} 
                      updated_at={item.updated_at} 
                      author_id={item.author_id} 
                      post_id={item.post_id} 
                      text={item.text}
                      setIsLoading={setIsLoadingComments}
                      updateComments={() => updateComments(prev => !prev)}
                    />
                  )
                }
              </>
          }
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
          id={postData?.id}
          created_at={postData?.created_at}
          updated_at={postData?.updated_at}
          scheduled_at={postData?.scheduled_at}
          author_id={postData?.author_id}
          title={postData?.title as string} 
          text={postData?.text as string}
          public={postData?.public as boolean}
          hashtages={postData?.hashtages as string[]}
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

export default ViewPostPage;
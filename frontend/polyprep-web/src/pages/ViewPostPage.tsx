import styles from './ViewPostPage.module.scss'
import store from '../redux-store/store';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPostComments, IComment, postComment } from '../server-api/comments';
import { deleteLike, getPostLikes, ILikes, postLike } from '../server-api/likes';
import { checkPostIsFavourite, deleteFavourite, postFavourite } from '../server-api/favourites';
import { deletePost, getPost, IPost } from '../server-api/posts';
import { getDate } from '../utils/UtilFunctions';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import IconDoc from '../icons/doc.svg'
import IconImage from '../icons/image.svg'
import IconAudio from '../icons/audio.svg'
import IconUser from '../icons/user.svg'
import IconPrivate from '../icons/private.svg'
import IconPublic from '../icons/public.svg'
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import IconDownload from '../icons/download.svg'
import IconDelete from '../icons/trash.svg'
import IconSend from '../icons/send.svg'
import IconShare from '../icons/share.svg'
import IconFavourite from '../icons/favourite.svg'
import IconFavouriteFilled from '../icons/favourite_fill.svg'
import IconEdit from '../icons/edit.svg'
import IconContextMenu from '../icons/context_menu.svg'
import IconUnlike from '../icons/unlike.svg'
import { Badge } from '../components/Badge';
import Comment from '../components/Comment';
import Loader from '../components/Loader';
import { getUser, IUser } from '../server-api/user';
import Modal from 'react-responsive-modal';
import SharePost from '../components/modals/SharePost';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';

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
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [user, setUser] = useState<IUser>();
  const [viewShare, setViewShare] = useState<boolean>(false);
  const [viewIncludes, setViewIncludes] = useState(false);

  const [isUpdate, updateComponent] = useState<boolean>(false);
  const [isUpdateComments, updateComments] = useState<boolean>(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

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
        navigate(-2);
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
    if (postData?.author_id) {
      (async () => {
        await getUser(postData?.author_id || "-1")
        .then((resp) => {
          setUser(resp as IUser)
        })
        .catch((error) => console.log("cannot load user"));
      }) ()
    }
  }, [postData]);

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
          <div className={styles.main_content}>
            <div className={styles.top_info}>
              <div className={styles.lin_container}>
                <img src={IconUser} alt='usericon'/>
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
            
            <h2 className={styles.title}>{ postData?.title }</h2>

            <Markdown remarkPlugins={[remarkGfm]}>{ postData?.text }</Markdown>
            
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

      <div className={styles.title_razdel} onClick={() => setViewIncludes(prev => !prev)}>
        <h2>Вложения</h2>
        <img src={!viewIncludes ? IconArrowDown : IconArrowUp} alt='arrow' />
      </div>

      <div className={viewIncludes ? styles.includes_container : styles.includes_container_hidden}>
        <Include name='text.pdf' />
        <Include name='myrecords.mp3' />
        <Include name='photo-2002020.png' />
      </div>

      <h2 id='comments'>Комментарии</h2>

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
        blockScroll={false}
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
        />
      </Modal>
    </div>
  )
}

export default ViewPostPage;
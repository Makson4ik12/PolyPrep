import styles from './ViewPostPage.module.scss'
import { useEffect, useRef, useState } from 'react';
import IconDoc from '../icons/doc.svg'
import IconImage from '../icons/image.svg'
import IconAudio from '../icons/audio.svg'
import IconUser from '../icons/user.svg'
import IconPrivate from '../icons/private.svg'
import IconPublic from '../icons/public.svg'
import { useLocation, useNavigate } from 'react-router-dom';
import { deleteComment, getPostComments, IComment, postComment, putComment } from '../server-api/comments';
import { getDate } from '../utils/UtilFunctions';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import IconDownload from '../icons/download.svg'
import IconDelete from '../icons/trash.svg'
import IconCancel from '../icons/delete.svg'
import IconSend from '../icons/send.svg'
import IconShare from '../icons/share.svg'
import IconFavourite from '../icons/favourite.svg'
import IconEdit from '../icons/edit.svg'
import IconSuccess from '../icons/success.svg'
import IconContextMenu from '../icons/context_menu.svg'
import { Badge } from '../components/Badge';
import IconUnlike from '../icons/unlike.svg'
import { getPost, IPost } from '../server-api/posts';
import store from '../redux-store/store';
import Loader from '../components/Loader';
import { deleteLike, getPostLikes, ILikes, postLike } from '../server-api/likes';
import useAutosizeTextArea from '../utils/CustomHooks';

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

interface ICommentMeta {
  setIsLoading: (val: boolean) => void;
  updateComments: () => void;
}

const Comment = (data: IComment & ICommentMeta) => {
  const userData = store.getState().auth.userData;
  const [isEdit, setIsEdit] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(data.text);

  useAutosizeTextArea(commentRef.current, value);

  const handleOnDelete = async () => {
    data.setIsLoading(true);

    await deleteComment(data.id || -1)
    .then((resp) => {
      data.updateComments();
    })
    .catch((error) => console.log("cannot delete post"));

    data.setIsLoading(false);
  }

  const handleCommentChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setValue(val);
  };

  const handleOnEdit = async () => {
    if (commentRef.current?.value.length == 0) {
      setValue(data.text);
      return;
    }

    await putComment({
      id: data.id,
      text: commentRef.current?.value || data.text,
      post_id: data.post_id
    })
    .then ((resp) => {
      setValue(commentRef.current?.value || data.text);
      setIsEdit(false);
    })
    .catch((error) => { 
      setIsEdit(false);
      console.log("comment not updated");
    });
  }

  return (
    <div className={styles.info_container}>
      <div className={styles.top_info}>
        <div className={styles.lin_container}>
          <img src={IconUser} alt='usericon'/>
          <p><b>{ data?.author_id === userData.uid ? "You" : "SomeUser" }</b> | { getDate(data.created_at || 0) }</p>
        </div>

        {
          data?.author_id === userData.uid ?
            <div className={styles.lin_container}>
              {
                isEdit ? 
                  <>
                    <img src={IconCancel} alt='cancel' className={styles.action_btn} onClick={() => setIsEdit(false)}/>
                    <img src={IconSuccess} alt='success' className={styles.action_btn} onClick={() => handleOnEdit()}/>
                  </>
                :
                  <>
                    <img src={IconEdit} alt='edit' className={styles.action_btn} onClick={() => setIsEdit(true)}/>
                    <img src={IconDelete} alt='delete' className={styles.action_btn} onClick={() => handleOnDelete()}/>
                  </>
              }
            </div>
          :
            <></>
        }
        
      </div>
      
      {
        isEdit ? 
          <form>
            <textarea 
              id="edit-comment" 
              name="comment" 
              placeholder='Крутой конспект!' 
              maxLength={350}
              required
              ref={commentRef}
              onChange={handleCommentChange}
              spellCheck={false}
              defaultValue={value}
              autoCapitalize='on'
              >
            </textarea>
          </form>
        :
          <p className={styles.text}>{value}</p>
      }
    </div>
  )
}

const ViewPostPage = () => {
  const location = useLocation();
  const post_id = Number(location.pathname.slice(location.pathname.lastIndexOf('/') + 1, location.pathname.length) || -1);
  const userData = store.getState().auth.userData;

  const [postData, setPostData] = useState<IPost>();
  const [postComments, setPostComments] = useState<IComment[]>();
  const [userLike, setUserLike] = useState(false);
  const [likes, setLikes] = useState<ILikes>();

  const [isUpdate, updateComponent] = useState<boolean>(false);
  const [isUpdateComments, updateComments] = useState<boolean>(false);

  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const [viewIncludes, setViewIncludes] = useState(false);
  const navigate = useNavigate();
  const screenSize = HandleResponsiveView();
  const [value, setValue] = useState("");

  const commentRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(commentRef.current, value);

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
      await postLike(postData?.id || -1)
      .then((resp) => {
        setUserLike(true);
        updateComponent(prev => !prev);
      })
      .catch((error) => console.log("cannot like post"));
    }
  }

  const handleCommentChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setValue(val);
  };

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
        setValue("");
        commentRef.current ? commentRef.current.value = "" : console.log("null comment ref");
      })
      .catch((error) => { 
        setIsLoadingComments(false);
        console.log("comment not created");
      });
    }

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
                      <img src={IconFavourite} className={styles.action_btn} alt='favourite'/>
                      <img src={IconShare} className={styles.action_btn} alt='share'/>
                      {
                        postData?.author_id === userData.uid ?
                          <>
                            <p>|</p>
                            <img src={IconEdit} className={styles.action_btn} alt='edit' onClick={() => navigate("/post/edit/" + postData?.id)}/>
                          </>
                        :
                          <></>
                      }
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

                            <button className={styles.action_item} onClick={() => navigate("/post/edit/" + postData?.id)}>
                              <img src={IconEdit} className={styles.action_btn} alt='edit'/>
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
                  <Badge text={item} key={item}/>
                )
              }
            </div>
            
            <div className={styles.divider} />

            <div className={styles.lin_container}>
              <div className={ userLike ? styles.likes_liked : styles.likes} onClick={(e) => handleOnClick(e)}>
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

      <h2>Комментарии</h2>
      {/* 
      
      TODO: очистить input после отправки коммента
      Реализовать редактирование комментов
      
      */}
      <div className={styles.includes_container}>
        {
          userData.uid ? 
            <form onSubmit={handleOnSubmitComment}>
              <textarea 
                id="comment" 
                name="comment" 
                placeholder='Крутой конспект!' 
                maxLength={350}
                required
                ref={commentRef}
                onChange={handleCommentChange}
                spellCheck={false}
                autoCapitalize='on'
                >
              </textarea>

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
    </div>
  )
}

export default ViewPostPage;
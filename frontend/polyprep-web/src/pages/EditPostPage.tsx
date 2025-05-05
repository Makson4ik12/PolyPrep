import styles from './NewPostPage.module.scss'

import TemporaryInclude from '../components/Include';
import Loader from '../components/Loader';
import TextareaAutosize from 'react-textarea-autosize';
import { useEffect, useRef, useState } from 'react';
import { getPost, IPost, putPost } from '../server-api/posts';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { deleteInclude, getPostIncludes, IInclude, postInclude } from '../server-api/includes';
import { EditPostInclude, IIncludeData } from '../components/Include';

import IconTitle from '../icons/title.svg'
import IconText from '../icons/text.svg'
import IconInclude from '../icons/include.svg'
import IconCreate from '../icons/create.svg'
import IconDelete from '../icons/delete.svg'
import IconSettings from '../icons/settings.svg'
import IconHashtag from '../icons/hashtag.svg'
import IconPrivate from '../icons/private.svg'
import IconSuccess from '../icons/success.svg'
import IconTime from '../icons/time.svg'
import IconBolt from '../icons/bolt.svg'

const EditPostPage = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const post_id = Number(location.pathname.slice(location.pathname.lastIndexOf('/') + 1, location.pathname.length) || -1);

  const [isPrivate, setIsPrivate] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);
  const [titleLen, setTitleLen] = useState(0);
  const [hashtagesLen, setHashtagsLen] = useState(0);
  const [isError, setIsError] = useState({ind: false, error: ""});

  const [oldIncludes, setOldIncludes] = useState<IInclude[]>([]);
  const [newIncludes, setNewIncludes] = useState<IIncludeData[]>([]);
  const [deleteIncludes, setDeleteIncludes] = useState<IInclude[]>([]);

  const [isLoadingIncludes, setIsLoadingIncludes] = useState(true);

  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const hashtagesRef = useRef<HTMLInputElement>(null);

  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postData, setPostData] = useState<IPost>();
  const navigate = useNavigate();

  const handleTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target?.value.length;
    setTitleLen(val);
  };

  const handleHashtagsChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target?.value.length;
    setHashtagsLen(val);
  };

  const handleAddInclude = () => {
    const newInclude: IIncludeData = {
      id: Date.now(),
      file: null
    };
    setNewIncludes(prev => [...prev, newInclude]);
  };
  
  const handleDeleteInclude = (id: number) => {
    setNewIncludes(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteOldInclude = (id: number) => {
    setDeleteIncludes(prev => [...prev, ...oldIncludes.filter((item) => item.id == id)]);
    setOldIncludes(prev => prev.filter(item => item.id !== id));
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElements = e.currentTarget.elements as typeof e.currentTarget.elements & {
      title: HTMLInputElement,
      text: HTMLTextAreaElement,
      hashtages: HTMLInputElement,
      date: HTMLInputElement
    };

    setIsLoadingPost(true);

    // update post
    try {
      await putPost({
        id: post_id,
        title: formElements.title.value,
        text: formElements.text.value,
        public: !isPrivate,
        hashtages: formElements.hashtages.value.split(" "),
        scheduled_at: isScheduled ? new Date(formElements.date.value).getTime() : null
      });
    } catch {
      setIsError({
        ind: true,
        error: "Ошибка при обновлении поста :("
      });

      setIsLoadingPost(false);
      return;
    }

    // delete old includes
    if (deleteIncludes.length > 0) {
      const deletePromises = deleteIncludes
        .map(async (item) => {
          try {
            await deleteInclude(item.id);
          } catch (error) {
            console.error(`error delete old include: `, error);
            throw error;
          }
        });

      try {
        await Promise.all(deletePromises);
      } catch {
        setIsError({
          ind: true,
          error: "Пост обновился, но некоторые вложения удалить и загрузить не удалось. Попробуйте заново :("
        });

        setIsLoadingPost(false);
        return;
      }
    }
    

    // upload new includes
    if (newIncludes.length > 0) {
      const uploadPromises = newIncludes
        .filter(item => item.file)
        .map(async (item) => {
          try {
            await postInclude({
              File: item.file!,
              Filename: item.file!.name,
              PostId: post_id
            });
          } catch (error) {
            console.error(`error load include: ${item.file?.name}:`, error);
            throw error;
          }
        });

      try {
        await Promise.all(uploadPromises);
      } catch {
        setIsError({
          ind: true,
          error: "Пост обновился, но некоторые новые вложения загрузить не удалось. Попробуйте заново :("
        });

        setIsLoadingPost(false);
        return;
      }
    }
      
    navigate(`/post/view/${post_id}`);
    setIsLoadingPost(false);

    await queryClient.invalidateQueries({ queryKey: ['userpage-userPosts'] });
    await queryClient.invalidateQueries({ queryKey: ['viewpostpage-id' + post_id] });
  }

  useEffect(() => {
    (async () => {
      setIsLoadingPost(true);

      await getPost(post_id)
      .then((resp) => {
        setPostData(resp as IPost);

        if ((resp as IPost).public)
          setIsPrivate(false);
      })
      .catch((error) => navigate("/error"));

      setIsLoadingPost(false);
    }) ()
  }, []);

  useEffect(() => {
      (async () => {
        setIsLoadingIncludes(true);
  
        await getPostIncludes(post_id)
        .then((resp) => {
          setOldIncludes(resp as IInclude[]);
        })
        .catch((error) => console.log("cannot load post includes"));
  
        setIsLoadingIncludes(false);
      }) ()
    }, []);

  return (
    <div className={styles.container}>
      <form onSubmit={handleOnSubmit}>
        <div className={styles.subheader}>
          <img src={IconTitle} alt='title' />
          <h2>Заголовок</h2>
        </div>
        
        <div className={styles.input_wrapper}>
          <input 
            name='title' 
            type='text' 
            placeholder='Конспекты по математике' 
            maxLength={150}
            ref={titleRef}
            onChange={handleTitleChange}
            defaultValue={ postData?.title }
            required>
          </input>

          <p>{titleLen} / 150</p>
        </div>
        
        <div className={styles.subheader}>
          <img src={IconText} alt='text' />
          <h2>Текст</h2>
        </div>

        <TextareaAutosize 
          id="text" 
          name="text" 
          placeholder='Абв'
          ref={textRef}
          spellCheck={false}
          defaultValue={ postData?.text }
          autoCapitalize='on'
          maxLength={15000}
          required
        />

        <div className={styles.subheader}>
          <img src={IconHashtag} alt='hashtages' />
          <h2>Хэштеги</h2>
        </div>
        
        <div className={styles.input_wrapper}>
          <input 
            name='hashtages' 
            type='text' 
            placeholder='#матан #крипта #хочу_зачет_по_бип' 
            maxLength={150}
            ref={hashtagesRef}
            onChange={handleHashtagsChange}
            defaultValue={ postData?.hashtages.join(" ") }
            required>
          </input>

          <p>{hashtagesLen} / 150</p>
        </div>
        

        <div className={styles.subheader}>
          <img src={IconInclude} alt='include' />
          <h2>Вложения</h2>
        </div>

        { 
        isLoadingIncludes ?
          <Loader />
        :
          <div className={styles.includes_container}>
            {
                oldIncludes?.map((item) => 
                  <EditPostInclude 
                    key={item.id}
                    link={item.link} 
                    id={item.id} 
                    filename={item.filename} 
                    size={item.size}
                    onDelete={handleDeleteOldInclude}
                  />
                )
            }

            {
              newIncludes.length > 0 ?
                newIncludes?.map((item) => 
                  <TemporaryInclude 
                    key={item.id}
                    id={item.id}
                    onDelete={handleDeleteInclude}
                    onFileChange={(id, file) => {
                      setNewIncludes(prev => prev.map(i => 
                        i.id === id ? { ...i, file } : i
                      ));
                    }}
                  />
                  )
              :
                <></>
            }

            <button type='button' onClick={() => handleAddInclude()}>
              <img src={IconCreate} alt='create' />
              <p>Добавить вложение</p>
            </button>
          </div>
        }

        <div className={styles.subheader}>
          <img src={IconSettings} alt='settings' />
          <h2>Дополнительно</h2>
        </div>

        <div className={styles.includes_container}>
          <div className={!isPrivate ? styles.options : styles.options_selected} onClick={() => setIsPrivate(prev => !prev)}>
            <div className={styles.lin_container}>
              <img src={IconPrivate} alt='private' />
              <p>Сделать пост приватным</p>
            </div>

            {
              isPrivate ?   
                <img src={IconSuccess} alt='success' className={styles.img_button}/>
              :
                <></>
            }
            
          </div>

          <div className={!isScheduled ? styles.options : styles.options_selected} onClick={ !isScheduled ? () => setIsScheduled(prev => !prev) : () => {}}>
            <div className={styles.lin_container}>
              <img src={IconTime} alt='time' />
              <p>Отложенная отправка</p>
            </div>

            <img src={IconDelete} alt='delete' className={ isScheduled ? styles.img_button : styles.img_button_hide } onClick={() => setIsScheduled(prev => !prev)}/>

            {
              isScheduled ?   
                <input name='date' type='datetime-local' placeholder='Сегодня'/>
              :
                <></>
            }
            
          </div>
        </div>
        
        <div className={styles.subheader}>
          <img src={IconBolt} alt='settings' />
          <h2>Последний шаг</h2>
        </div>
        
        <p className={ isError.ind ? styles.incorrect_login : styles.incorrect_login_hidden }> {isError.error }</p>
        
        {
          isLoadingPost ? <Loader />
          :
            <button type='submit'>
              <p>Сохранить изменения</p>
            </button>
        }
        
      </form>
    </div>
  )
}

export default EditPostPage;
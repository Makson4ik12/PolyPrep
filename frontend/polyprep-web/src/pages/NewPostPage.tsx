import styles from './NewPostPage.module.scss'

import Loader from '../components/Loader';
import TextareaAutosize from 'react-textarea-autosize';
import { useRef, useState } from 'react';
import { deletePost, IPost, postPost } from '../server-api/posts';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import IncludeTemp, { IIncludeData } from '../components/Include';
import { deleteInclude, getPostIncludes, IInclude, postInclude } from '../server-api/includes';

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

const NewPostPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isPrivate, setIsPrivate] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const [titleLen, setTitleLen] = useState(0);
  const [hashtagesLen, setHashtagsLen] = useState(0);
  const [isError, setIsError] = useState({ind: false, error: ""});
  const [isLoading, setIsLoading] = useState(false);
  const [includeData, setIncludeData] = useState<IIncludeData[]>([]);

  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const hashtagesRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target?.value.length;
    setTitleLen(val);
  };

  const handleHashtagsChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target?.value.length;
    setHashtagsLen(val);
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElements = e.currentTarget.elements as typeof e.currentTarget.elements & {
      title: HTMLInputElement,
      text: HTMLTextAreaElement,
      hashtages: HTMLInputElement,
      date: HTMLInputElement
    };

    let postResponse = null;

    try {
      setIsLoading(true);
      
      // upload post
      postResponse = await postPost({
        title: formElements.title.value,
        text: formElements.text.value,
        public: !isPrivate,
        hashtages: formElements.hashtages.value.split(" "),
        scheduled_at: isScheduled ? new Date(formElements.date.value).getTime() : null
      }) as IPost;
      
      const postId = postResponse.id;

      if (!postId) 
        throw new Error('Post not found');
      
      // upload includes
      if (includeData.length > 0) {
        const uploadPromises = includeData
          .filter(item => item.file)
          .map(async (item) => {
            try {
              await postInclude({
                File: item.file!,
                Filename: item.file!.name,
                PostId: postId
              });
            } catch (error) {
              console.error(`error load include: ${item.file?.name}:`, error);
              throw error;
            }
          });
      
        await Promise.all(uploadPromises);
      }
      
      navigate(`/post/view/${postId}`);
      
    } catch (error) {
      if (postResponse?.id) { 
        // get post includes
        try {
          const postIncludes = await getPostIncludes(postResponse?.id) as IInclude[];
          
          // delete includes
          if (postIncludes.length > 0) {
            const deletePromises = postIncludes
              .map(async (item) => {
                try {
                  await deleteInclude(item.id);
                } catch (error) {
                  console.error(`error delete include: `, error);
                  throw error;
                }
              });
          
            await Promise.all(deletePromises);
          }

        } catch (getIncludesError) {
          console.error('error delete include:', getIncludesError);
        }

        // delete post
        if (postResponse?.id) {
          try {
            await deletePost(postResponse.id);
          } catch (deleteError) {
            console.error('error delete post:', deleteError);
          }
        }
      }

      console.log("error create post: " + error)
      
      setIsError({
        ind: true,
        error: "Ошибка при создании поста :("
      });
    } finally {
      setIsLoading(false);
    }

    await queryClient.invalidateQueries({ queryKey: ['userpage-userPosts'] });
  }

  const handleAddInclude = () => {
    const newInclude: IIncludeData = {
      id: Date.now(),
      file: null
    };
    setIncludeData(prev => [...prev, newInclude]);
  };
  
  const handleDeleteInclude = (id: number) => {
    setIncludeData(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleOnSubmit} autoComplete="off">
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
            pattern="^(#[a-zA-Zа-яА-ЯёЁ0-9_]{2,}\s*)+$"
            title="Хэштеги должны начинаться с # и содержать минимум 2 символа, используя только буквы, цифры и _"
            ref={hashtagesRef}
            onChange={handleHashtagsChange}
            required>
          </input>

          <p>{hashtagesLen} / 150</p>
        </div>
        
        <div className={styles.subheader}>
          <img src={IconInclude} alt='include' />
          <h2>Вложения</h2>
        </div>

        <div className={styles.includes_container}>
          {
            includeData.length > 0 ?
              includeData?.map((item) => 
                <IncludeTemp 
                  key={item.id}
                  id={item.id}
                  onDelete={handleDeleteInclude}
                  onFileChange={(id, file) => {
                    setIncludeData(prev => prev.map(i => 
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
          isLoading ? <Loader />
          :
          <button type='submit'>
            <p>Создать пост</p>
          </button>
        }
      </form>
    </div>
  )
}

export default NewPostPage;
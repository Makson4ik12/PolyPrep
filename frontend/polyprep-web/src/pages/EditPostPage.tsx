import { JsxElement } from 'typescript';
import styles from './NewPostPage.module.scss'
import { useRef, useState } from 'react';
import useAutosizeTextArea from '../utils/CustomHooks';
import IconTitle from '../icons/title.svg'
import IconText from '../icons/text.svg'
import IconInclude from '../icons/include.svg'
import IconDoc from '../icons/doc.svg'
import IconImage from '../icons/image.svg'
import IconAudio from '../icons/audio.svg'
import IconCreate from '../icons/create.svg'
import IconDelete from '../icons/delete.svg'
import IconSettings from '../icons/settings.svg'
import IconHashtag from '../icons/hashtag.svg'
import IconPrivate from '../icons/private.svg'
import IconSuccess from '../icons/success.svg'
import IconTime from '../icons/time.svg'
import IconBolt from '../icons/bolt.svg'

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
      <img src={IconDelete} alt='delete' className={styles.img_button}/>
    </div>
  )
}

const EditPostPage = () => {
  const [value, setValue] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [titleLen, setTitleLen] = useState(0);
  const [hashtagsLen, setHashtagsLen] = useState(0)

  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const hashtagsRef = useRef<HTMLInputElement>(null);

  useAutosizeTextArea(textRef.current, value);

  const handleTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target?.value.length;
    setTitleLen(val);
  };

  const handleHashtagsChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target?.value.length;
    setHashtagsLen(val);
  };

  const handleTextChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setValue(val);
  };

  return (
    <div className={styles.container}>
      <form>
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

        <textarea 
          id="text" 
          name="text" 
          placeholder='Абв'
          ref={textRef}
          onChange={handleTextChange}
          spellCheck={false}
          autoCapitalize='on'
          >
        </textarea>

        <div className={styles.subheader}>
          <img src={IconHashtag} alt='hashtags' />
          <h2>Хэштеги</h2>
        </div>
        
        <div className={styles.input_wrapper}>
          <input 
            name='hashtags' 
            type='text' 
            placeholder='#матан #крипта #хочу_зачет_по_бип' 
            maxLength={150}
            ref={hashtagsRef}
            onChange={handleHashtagsChange}
            required>
          </input>

          <p>{hashtagsLen} / 150</p>
        </div>
        

        <div className={styles.subheader}>
          <img src={IconInclude} alt='include' />
          <h2>Вложения</h2>
        </div>

        <div className={styles.includes_container}>
          <Include name='text.pdf' />
          <Include name='myrecords.mp3' />
          <Include name='photo-2002020.png' />
          <button type='button'>
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

        <button type='submit'>
          <p>Сохранить изменения</p>
        </button>
      </form>
    </div>
  )
}

export default EditPostPage;
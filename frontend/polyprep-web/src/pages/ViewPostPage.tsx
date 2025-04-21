import styles from './ViewPostPage.module.scss'
import { useEffect, useState } from 'react';
import IconDoc from '../icons/doc.svg'
import IconImage from '../icons/image.svg'
import IconAudio from '../icons/audio.svg'
import IconUser from '../icons/user.svg'
import IconPrivate from '../icons/private.svg'
import { useLocation } from 'react-router-dom';
import { IComment } from '../server-api/comments';
import { getDate, getTextColor } from '../utils/UtilFunctions';
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import IconDownload from '../icons/download.svg'
import IconSend from '../icons/send.svg'

interface IInclude {
  name: string;
}

interface IBadge {
  text: string;
  icon?: string
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
      <img src={IconDownload} alt='download' className={styles.img_button}/>
    </div>
  )
}

const Badge = (data: IBadge) => {
  const [colors, setColors] = useState<{bgColor: string, textColor: string}>({bgColor: "white", textColor: "black"});

  useEffect(() => {
    const bgColor = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
    setColors({bgColor: bgColor, textColor: getTextColor(bgColor)});
  }, []);

  return (
    <div className={styles.badge} style={{backgroundColor: colors.bgColor}}>
      {
        data.icon ? <img src={data.icon} alt='icon'/> : <></>
      }
      <p style={{color: colors.textColor}}>{data.text}</p>
    </div>
  )
}

const Comment = (data: IComment) => {
  return (
    <div className={styles.info_container}>
      <div className={styles.lin_container}>
        <img src={IconUser} alt='usericon'/>
        <p><b>Maks Pupkin</b> | { getDate(data.created_at) }</p>
      </div>
      <div className={styles.divider} />

      <p className={styles.text}>{data.text}</p>
    </div>
  )
}

const ViewPostPage = () => {
  const location = useLocation();
  const post_id = location.pathname.slice(location.pathname.lastIndexOf('/') + 1, location.pathname.length);
  const test_text = "Текст текст текстtransition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);transit\nТекст текст текстtransition: all 0.6s cubic-bezier(0.165, 0.84aa, 0.44, 1);transit\n"

  const [viewIncludes, setViewIncludes] = useState(true);

  return (
    <div className={styles.container}>
      <div className={styles.info_container}>
        <div className={styles.lin_container}>
          <img src={IconUser} alt='usericon'/>
          <p><b>Maks Pupkin</b> | 23.04.2025 в 12:22</p>

          <div className={styles.badge}>
            <img src={IconPrivate} alt='private'/>
            <p>Private</p>
          </div>
        </div>

        <div className={styles.lin_container}>
          <Badge text='#хочу5'/>
          <Badge text='#math'/>
          <Badge text='#криптография'/>
        </div>

        <div className={styles.divider} />

        <h2>Заголовок какой либо</h2>
        <p className={styles.text}>{test_text}</p>
      </div>

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
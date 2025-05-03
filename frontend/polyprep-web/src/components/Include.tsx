import { IInclude } from '../server-api/includes'
import styles from '../pages/ViewPostPage.module.scss'

export const Include = (data: IInclude) => {
  return (
    <div className={styles.include}>
      {/* <div className={styles.lin_container}>
        <img src={
          (data.name.endsWith(".png") || data.name.endsWith(".jpg")) ? IconImage : data.name.endsWith(".mp3") ? IconAudio : IconDoc
        } alt='inlude' />
        <p>{data.name}</p>
      </div>
      <img src={IconDownload} alt='download' className={styles.action_btn}/> */}
    </div>
  )
}
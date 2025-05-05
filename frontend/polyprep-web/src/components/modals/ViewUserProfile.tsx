import styles from '../modals/ViewUserProfile.module.scss'

import { IUser } from '../../server-api/user';

import IconUser from '../../icons/user.svg'
import IconMail from '../../icons/mail.svg'

export default function ViewUserProfile(data: IUser & { onClose: () => void }) {
  return (
    <div className={styles.container}>
      <img
        src={((data.img_link != "") ? data.img_link : IconUser)}  
        alt='user-icon' 
      />

      <div className={styles.title_container}>
        <img src={IconMail} alt='mail' />
        <h2 className={styles.title}>{ data.username }</h2>
      </div>
    </div>
  )
}
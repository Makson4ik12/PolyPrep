import styles from './Loader.module.scss'

export default function Loader() {
  return (
    <div className={styles.container}>
      <div className={styles.loader}>
      
      </div>
    </div>
  )
}

export function MiniLoader() {
  return (
    <div className={styles.container}>
      <div className={styles.mini_loader}>
      
      </div>
    </div>
  )
}
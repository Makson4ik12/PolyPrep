import styles from '../modals/ChangeUserImage.module.scss'

interface IPreviewInclude {
  url: string;
  filename: string;
}

export default function PreviewIclude(data: IPreviewInclude) {
  return (
    <div className={styles.container}>
      <img
        src={data.url}  
        alt='preview-img' 
      />
      <p>{data.filename}</p>
    </div>
  )
}
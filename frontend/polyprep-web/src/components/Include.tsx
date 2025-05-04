import { IInclude } from '../server-api/includes'
import viewPoststyles from '../pages/ViewPostPage.module.scss'
import newIncludeStyle from '../pages/NewPostPage.module.scss'
import { JSX, useState } from 'react';
import IconDelete from '../icons/delete.svg'
import IconDownload from '../icons/download.svg'
import IconCloud from '../icons/cloud.svg'
import IconDoc from '../icons/doc.svg'
import IconAudio from '../icons/audio.svg'
import { detectFileType } from '../utils/UtilFunctions';

interface IIncludeTemp {
  id: number;
  onDelete: (id: number) => void;
  onFileChange: (id: number, file: File) => void;
}

export interface IIncludeData {
  id: number;
  file: File | null;
}

// type FileType = "img" | "word" | "excel" | "pdf" | "powerpoint" | "audio" | "video" | "other";
export const ViewPostInclude = (data: IInclude) => {
  const file_type = detectFileType(data.filename);

  return (
    <div className={viewPoststyles.include}>
      <div className={viewPoststyles.lin_container}>
        <img 
          src={
            file_type === "img" ?
              data.link
            :
              file_type === "word" ?
              IconCloud
            :
              file_type === "excel" ?
              IconCloud
            :
              file_type === "pdf" ?
              IconCloud
            :
              file_type === "powerpoint" ?
              IconCloud
            :
              file_type === "audio" ?
              IconAudio
            :
              file_type === "video" ?
              IconCloud
            :
              IconDoc
          } 
          alt='inlude' 
        />
        <p>{data.filename}</p>
      </div>
      <img src={IconDownload} alt='download' className={viewPoststyles.action_btn}/>
    </div>
  )
}

export const EditPostInclude = (data: IInclude & { onDelete: (id: number) => void }) => {
  return (
    <div className={newIncludeStyle.includes_edit}>
      <div className={newIncludeStyle.linerar}>
        <img src={IconCloud} alt='cloud' className={newIncludeStyle.action_btn}/>
        <p>{data.filename}</p>
      </div>

      <img src={IconDelete} alt='delete' className={newIncludeStyle.action_btn} onClick={() => data.onDelete(data.id)}/>
    </div>
  )
}

const TemporaryInclude = (data: IIncludeTemp) => {
  const [isError, setIsError] = useState({ind: false, error: ""});
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      data.onFileChange(data.id, e.target.files[0]);
    }
  };

  return (
    <div className={newIncludeStyle.includes_new}>
      <div className={newIncludeStyle.linerar}>
        <input 
          type="file" 
          id="img" 
          name="img" 
          accept="image/jpeg,image/png,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" 
          required 
          onChange={handleFileChange}
          placeholder='image'
        />

        <img src={IconDelete} alt='delete' onClick={() => data.onDelete(data.id)}/>
      </div>

      <p className={ isError.ind ? newIncludeStyle.incorrect_login : newIncludeStyle.incorrect_login_hidden }> {isError.error }</p>
    </div>
  )
}

export type IncludeTempArray = JSX.Element[];
export default TemporaryInclude;
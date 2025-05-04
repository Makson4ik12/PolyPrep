import { IInclude } from '../server-api/includes'
import viewPoststyles from '../pages/ViewPostPage.module.scss'
import newIncludeStyle from '../pages/NewPostPage.module.scss'
import { JSX, useState } from 'react';
import IconDelete from '../icons/delete.svg'
import IconDownload from '../icons/download.svg'
import IconCloud from '../icons/cloud.svg'
import IconMd from '../icons/md.svg'
import IconDoc from '../icons/doc.svg'
import IconAudio from '../icons/audio.svg'
import IconWord from '../icons/word.svg'
import IconExcel from '../icons/excel.svg'
import IconPowerpoint from '../icons/powerpoint.svg'
import IconPdf from '../icons/pdf.svg'
import IconVideo from '../icons/pdf.svg'
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

export const ViewPostInclude = (data: IInclude) => {
  return (
    <div className={viewPoststyles.include}>
      <div className={viewPoststyles.lin_container}>
        <img 
          src={detectFileType(data.filename, data.link)}
          alt='include' 
        />
        <p>{data.filename}</p>
      </div>
      <img src={IconDownload} alt='download' className={viewPoststyles.action_btn} onClick={() => window.open(data.link, "_blank")}/>
    </div>
  )
}

export const EditPostInclude = (data: IInclude & { onDelete: (id: number) => void }) => {
  return (
    <div className={newIncludeStyle.includes_edit}>
      <div className={newIncludeStyle.linerar}>
        <img 
          src={detectFileType(data.filename, data.link)}
          alt='include' 
        />
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
          accept="image/jpeg, image/png, application/pdf, .doc, .docx, .rtf, .odt, .xls, .xlsx, .csv, .ods, .ppt, .pptx, .odp, .mp3, .mp4, .avi, .mov, .txt, .md" 
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
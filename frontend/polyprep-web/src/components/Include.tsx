import viewPoststyles from '../pages/ViewPostPage.module.scss'
import newIncludeStyle from '../pages/NewPostPage.module.scss'

import Modal from 'react-responsive-modal';
import PreviewInclude from './modals/PreviewInclude';
import { IInclude } from '../server-api/includes'
import { JSX, useState } from 'react';
import { detectFileType } from '../utils/UtilFunctions';

import IconDelete from '../icons/delete.svg'
import IconDownload from '../icons/download.svg'

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
  const [viewPreview, setViewPreview] = useState(false);
  const isImg = detectFileType(data.filename, data.link) === data.link;

  return (
    <>
      <div className={viewPoststyles.include} onClick={isImg ? () => setViewPreview(true) : () => {}}>
        <div className={viewPoststyles.lin_container}>
          <img 
            src={detectFileType(data.filename, data.link)}
            alt='include' 
          />
          <p>{data.filename}</p>
        </div>
        <img src={IconDownload} alt='download' className={viewPoststyles.action_btn} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(data.link, "_blank");
          }}
        />
      </div>

      <Modal 
        open={viewPreview} 
        onClose={() => setViewPreview(false)} 
        showCloseIcon={true} 
        animationDuration={400}
        blockScroll={true}
        center
      >
        <PreviewInclude url={data.link} filename={data.filename}/>
      </Modal>
    </>
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
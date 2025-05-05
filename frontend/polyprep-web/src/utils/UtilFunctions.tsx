import IconMd from '../icons/md.svg'
import IconDoc from '../icons/doc.svg'
import IconAudio from '../icons/audio.svg'
import IconWord from '../icons/word.svg'
import IconExcel from '../icons/excel.svg'
import IconPowerpoint from '../icons/powerpoint.svg'
import IconPdf from '../icons/pdf.svg'
import IconVideo from '../icons/pdf.svg'

export const getDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${date.getFullYear()} в ${hours}:${minutes}`;
};

export const copyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};

export const getImgLink = (url: string) => {
  if (url == "")
    return "";
  
  return url + `?t=${Date.now().toString()}`;
}

export const detectFileType = (filename: string, link: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    // img
    case 'png':
    case 'jpg':
    case 'jpeg':
      return link;

    // word
    case 'doc':
    case 'docx':
    case 'rtf':
    case 'odt':
      return IconWord;

    // excel
    case 'xls':
    case 'xlsx':
    case 'csv':
    case 'ods':
      return IconExcel;

    // pdf
    case 'pdf':
      return IconPdf;

    // powerpoint
    case 'ppt':
    case 'pptx':
    case 'odp':
      return IconPowerpoint;

    // audio
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'aac':
    case 'flac':
      return IconAudio;

    // video
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
    case 'webm':
      return IconVideo;

    // md
    case 'md':
      return IconMd;

    // other
    default:
      return IconDoc;
  }
}
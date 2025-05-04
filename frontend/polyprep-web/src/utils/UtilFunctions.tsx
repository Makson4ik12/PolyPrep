export const getDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${date.getFullYear()} в ${hours}:${minutes}`;
};

export const getTextColor = (hexBgColor: string) => {
  hexBgColor = hexBgColor.replace("#", "");
  
  const r = parseInt(hexBgColor.substring(0, 2), 16);
  const g = parseInt(hexBgColor.substring(2, 4), 16);
  const b = parseInt(hexBgColor.substring(4, 6), 16);

  return ((0.299 * r + 0.587 * g + 0.114 * b) / 255) > 0.5 ? "#000000" : "#FFFFFF";
}

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

type FileType = "img" | "word" | "excel" | "pdf" | "powerpoint" | "audio" | "video" | "other";

export const detectFileType = (filename: string): FileType => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    // img
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'svg':
    case 'bmp':
      return 'img';

    // word
    case 'doc':
    case 'docx':
    case 'rtf':
    case 'odt':
      return 'word';

    // excel
    case 'xls':
    case 'xlsx':
    case 'csv':
    case 'ods':
      return 'excel';

    // pdf
    case 'pdf':
      return 'pdf';

    // powerpoint
    case 'ppt':
    case 'pptx':
    case 'odp':
      return 'powerpoint';

    // audio
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'aac':
    case 'flac':
      return 'audio';

    // video
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
    case 'webm':
      return 'video';

    // other
    default:
      return 'other';
  }
}
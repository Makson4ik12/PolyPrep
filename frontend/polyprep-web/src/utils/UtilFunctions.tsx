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
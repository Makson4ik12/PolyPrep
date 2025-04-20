export const getDate = (timestamp: number) => {
  const data = new Date(timestamp);
  return data.getDate() + "." + (data.getMonth() + 1) + "." + data.getFullYear() + " в " + data.getHours() + ":" + data.getMinutes();
}

export const getTextColor = (hexBgColor: string) => {
  hexBgColor = hexBgColor.replace("#", "");
  
  const r = parseInt(hexBgColor.substring(0, 2), 16);
  const g = parseInt(hexBgColor.substring(2, 4), 16);
  const b = parseInt(hexBgColor.substring(4, 6), 16);

  return ((0.299 * r + 0.587 * g + 0.114 * b) / 255) > 0.5 ? "#000000" : "#FFFFFF";
}
import { useState, useEffect } from 'react';

export const screenSizes = { 
    __1540: {width: 1540, name: "DESKTOP"},
    __1200: {width: 1200, name: "BIG_TABLET"}, 
    __1000: {width: 1000, name: "SMALL_TABLET"},
    __768: {width: 768, name: "SMALL_TABLET"}, 
    __480: {width: 480, name: "BIG_MOBILE"}, 
    __320: {width: 320, name: "SMALL_MOBILE"} 
};

export default function HandleResponsiveView(): {width: number, name: string} {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize(): void {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (windowWidth > screenSizes.__1540.width) {
    return screenSizes.__1540;
  } else if ((windowWidth <= screenSizes.__1540.width) && (windowWidth > screenSizes.__1200.width)) {
    return screenSizes.__1200;
  } else if ((windowWidth <= screenSizes.__1200.width) && (windowWidth > screenSizes.__1000.width)) {
      return screenSizes.__1000;
  } else if ((windowWidth <= screenSizes.__1000.width) && (windowWidth > screenSizes.__768.width)) {
    return screenSizes.__768;
  } else if ((windowWidth <= screenSizes.__768.width) && (windowWidth > screenSizes.__480.width)) {
    return screenSizes.__480;
  } else {
    return screenSizes.__320;
  }
}
import { RaygunV2 } from 'raygun4js';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { pageNameSelector } from '../selectors';

declare global {
  interface Window {
    rg4js?: RaygunV2;
  }
}

export const useTracking = () => {
  const pageName = useSelector(pageNameSelector);
  useEffect(() => {
    if (window.rg4js) {
      window.rg4js('trackEvent', {
        type: 'pageView',
        path: `/order/${pageName}`,
      });
    }
  }, [pageName]);
};

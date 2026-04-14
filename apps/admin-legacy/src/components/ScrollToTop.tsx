import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

/**
 * ScrollToTop component ensures that the window scrolls to the top
 * whenever the route changes and tracks page views for GA4.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page on route change
    window.scrollTo(0, 0);
    
    // Track page view for GA4
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
};

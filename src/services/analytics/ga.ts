export const trackGA = (event: string) => {
  if (window.gtag) {
    window.gtag('event', event);
  }
};
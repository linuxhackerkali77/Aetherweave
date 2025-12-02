// Performance optimization utilities

export const preloadRoute = (href: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
};

export const enableFastMode = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.add('fast-nav');
  }
};

export const disableFastMode = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('fast-nav');
  }
};
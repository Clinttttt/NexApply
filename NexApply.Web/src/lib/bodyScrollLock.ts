let lockCount = 0;
let previousOverflow: string | null = null;

export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return () => {};

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  lockCount += 1;

  return () => {
    unlockBodyScroll();
  };
};

export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;

  lockCount -= 1;

  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? '';
    previousOverflow = null;
  }
};


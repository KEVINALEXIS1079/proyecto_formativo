export function throttle<T extends (...a: any[]) => void>(fn: T, wait = 400) {
  let last = 0;
  let t: any;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remain = last + wait - now;
    if (remain <= 0) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(t);
      t = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, remain);
    }
  };
}

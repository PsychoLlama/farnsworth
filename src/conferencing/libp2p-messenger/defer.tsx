export default function defer<T>(): DeferredPromise<T> {
  let resolve: DeferredPromise<T>['resolve'];
  let reject: DeferredPromise<T>['reject'];

  const promise: Promise<T> = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    resolve,
    promise,
    reject,
  };
}

export interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: Error): void;
}

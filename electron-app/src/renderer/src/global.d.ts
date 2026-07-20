import type {AppApi} from '../../preload/index';

declare global {
  interface Window {
    api: AppApi;
  }
}

declare module '*.png' {
  const src: string;
  export default src;
}

export {};

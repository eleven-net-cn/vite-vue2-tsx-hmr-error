/// <reference types="vite/client" />

declare module 'vue/types/vue' {
  interface Vue {
    /** 来自wrapper的minxin，提供事件能力 */
    // localEvent: LocalEvent;
    /** pzLoader，提供预加载能力 */
    pzLoader?: {
      load: (param: { urlList: string[] }) => void;
    };
    $pzConfig: string;
  }
}
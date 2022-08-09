import { puzzleCDNBaseURL } from 'appConfig';

export const getPageUrl = ({
  env, isSea, curBiz, publishKey
}:{env:string, isSea:boolean, curBiz:string, publishKey:string}) => {
  const urlBiz = curBiz.replace(/_.*/g, '');
  const cdnType = isSea ? 'global' : 'cn';
  const baseURL = puzzleCDNBaseURL[cdnType][env];
  const eventPath = cdnType === 'global' ? publishKey : `event/puzzle/${publishKey}`;
  return `${baseURL}/${urlBiz}/${eventPath}/index.html`;
};
export const getPageHref = ({
  env, isSea, curBiz, publishKey, type, eventKey
}:{env:string, isSea:boolean, curBiz:string, publishKey:string, type:string, eventKey?:string}) => `${getPageUrl({
  env, isSea, curBiz, publishKey
})}${getPageQueryString({ type, curBiz, eventKey })}`;
export const getPageQueryString = ({ type, curBiz, eventKey } : { type: string, curBiz: string, eventKey?: string }) => (type !== 'gameWebview'
  ? `?game_biz=${curBiz}`
  : `?game_biz=${curBiz}&sign_type=2&authkey_ver=1&auth_appid=${eventKey}`);

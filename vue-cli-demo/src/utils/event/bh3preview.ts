import { getPageHref } from '../urlHandler';

export const getAllUrl = ({
  eventKey, publishKey, isSea = false
}:{eventKey:string, isSea:boolean, publishKey:string}) => {
  const getPageHrefNoSearch = ({ env, curBiz }) => getPageHref({
    env, isSea, curBiz, publishKey, type: 'normal', eventKey
  });
  const _getPageHref = ({ env, curBiz, type }) => `${getPageHref({
    env, isSea, curBiz, publishKey, type, eventKey
  })}${type === 'gameWebview' ? gameFullScreenUrl : bbsUrl}`;
  const gameFullScreenUrl = '&win_mode=fullscreen';
  const bbsUrl = isSea ? '&mhy_presentation_style=fullscreen&mhy_landscape=true&mhy_hide_status_bar=true' : '&bbs_landscape=true&bbs_presentation_style=fullscreen&mhy_hide_status_bar=true';
  if (!isSea) {
    return `
    测试体验地址
    ${_getPageHref({ env: 'test', curBiz: 'bh3_cn', type: 'normal' })}
    测试公告地址
    ${_getPageHref({ env: 'test', curBiz: 'bh3_cn', type: 'gameWebview' })}
    外网预览地址
    ${_getPageHref({ env: 'pre', curBiz: 'bh3_cn', type: 'normal' })}
    正式体验地址
    ${_getPageHref({ env: 'prod', curBiz: 'bh3_cn', type: 'normal' })}
    正式公告地址
      游戏内
      ${_getPageHref({ env: 'test', curBiz: 'bh3_cn', type: 'gameWebview' })}
      游戏外
      ${_getPageHref({ env: 'prod', curBiz: 'bh3_cn', type: 'normal' })}
    `;
  }
  const getPageHrefInGameByLang = ({
    env, curBiz, lang, type
  }) => `${_getPageHref({
    env, curBiz, type
  })}&lang=${lang}`;
  const langMap = {
    bh3_asia: [
      'zh-tw'
    ],
    bh3_eur: [
      'zh-cn',
      'en-us',
      'de-de',
      'fr-fr'
    ],
    bh3_jp: [
      'ja-jp'
    ],
    bh3_kr: [
      'ko-kr'
    ],
    bh3_os: [
      'zh-cn',
      'en-us',
      'id-id',
      'th-th',
      'vi-vn'
    ],
    bh3_usa: [
      'zh-cn',
      'en-us',
      'de-de',
      'fr-fr'
    ]
  };
  const bizNameMap = {
    bh3_asia: '繁中服（asia）',
    bh3_os: '东南亚服（os）',
    bh3_kr: '韩服（kr）',
    bh3_eur: '欧洲服（eur）',
    bh3_usa: '美服（usa）',
    bh3_jp: '日服（jp）'
  };
  // 游戏内 - 公告 - 测试链接
  const getUrlByGameBizLang = ({ env, type }) => {
    let link = '';
    Object.keys(langMap).forEach((curBiz) => {
      const langList = langMap[curBiz];
      link += `
      ${bizNameMap[curBiz]}
      `;
      langList.forEach((lang) => {
        link += `
        ${getPageHrefInGameByLang({
    env, curBiz, lang, type
  })}
        `;
      });
    });
    return link;
  };
  const bizNameMapInGame = {
    bh3_asia: '繁中服（asia）',
    bh3_os: '东南亚服（os）',
    bh3_kr: '韩服（kr）',
    bh3_global: '欧美服链接（GLB）',
    bh3_jp: '日服（jp）'
  };
  const getUrlByGameBiz = ({ env, type }) => {
    let link = '';
    Object.keys(bizNameMapInGame).forEach((curBiz) => {
      link += `
        ${bizNameMapInGame[curBiz]}
        ${_getPageHref({
    env, curBiz, type
  })}
        `;
    });
    return link;
  };
  const getUrlByGameBizNoSearch = ({ env }) => {
    let link = '';
    Object.keys(bizNameMap).forEach((curBiz) => {
      link += `
        ${bizNameMap[curBiz]}
        ${getPageHrefNoSearch({
    env, curBiz
  })}
        `;
    });
    return link;
  };
  const allSeaUrl = `
    游戏内 - 公告 - 测试链接
    ${getUrlByGameBizLang({ env: 'test', type: 'gameWebview' })}
    游戏内 - 活动面板 - 测试链接
    ${getUrlByGameBiz({ env: 'test', type: 'gameWebview' })}
    HYL - 测试链接
    ${getUrlByGameBizLang({ env: 'test', type: 'normal' })}
    游戏内 - 正式链接
    ${getUrlByGameBiz({ env: 'prod', type: 'gameWebview' })}
    HYL - 正式链接
    ${getUrlByGameBizLang({ env: 'prod', type: 'normal' })}
    宣发渠道2 - 正式链接
    ${getUrlByGameBizNoSearch({ env: 'prod' })}
  `;
  console.log(allSeaUrl);
};

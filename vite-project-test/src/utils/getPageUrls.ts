export default function (event = {} as any) {
  const { game_biz = '', event_key } = event;
  const isCn = game_biz.split('_').pop() === 'cn';
  const urlBiz = game_biz.split('_').shift();
  const templateUrl = `https://webstatic{env}.mihoyo.com/${urlBiz}/event/puzzle/${event_key}/index.html`;

  return {
    test: templateUrl.replace('{env}', isCn ? '-test' : '-sea-test'),
    // test: templateUrl.replace('{env}', isCn ? '-test' : '-test'),
    pre: templateUrl.replace('{env}', isCn ? '' : '-sea').replace('/event/', '/prevent/'),
    prd: templateUrl.replace('{env}', isCn ? '' : '-sea')
  };
}

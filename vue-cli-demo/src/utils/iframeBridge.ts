// 传给注册的回调函数的数据
interface Options{
  options?: any,
}
// iframe传过来的数据
interface IframeData{
  bridgeName:string,
  actionName:string,
  options?:any,
  actionId:number
}
// 一个bridge的action列
interface Actions {
  [propName:string]: (options?:Options) => undefined|Promise<any>
}
// bridge列表
interface BridgeList {
  [propName:string]:Actions
}
interface ActionData {
  iframe?: HTMLIFrameElement,
  data?:any
}
// 反送给iframe的id
interface ToIframeData{
  actionId: number,
  data?:any,
  bridgeName:string
}
const bridgeList:BridgeList = {};
export const sendDataToIframe = ({
  bridgeName, iframe, data, actionName, actionId
}) => {
  iframe.contentWindow?.postMessage({
    data,
    bridgeName,
    actionName,
    actionId
  }, '*');
};
const sendToIframe = (iframe:HTMLIFrameElement, options:ToIframeData) => {
  iframe.contentWindow?.postMessage(options, '*');
};
// 监听iframe发来的信息
window.addEventListener('message', async (e:MessageEvent) => {
  const { data } = e;
  const bridge = bridgeList[data?.bridgeName];
  if (!bridge) return;
  const action = bridge[(data as IframeData).actionName];
  if (!action) return;
  const actionData:ActionData = await action((data as IframeData).options) || {};
  if (!actionData.iframe) return;
  sendToIframe(actionData.iframe, {
    actionId: (data as IframeData).actionId,
    bridgeName: (data as IframeData).bridgeName,
    data: actionData.data
  });
});
// 设置setBridge
export const setBridge = (bridgeName:string, actions:Actions) => {
  if (bridgeList[bridgeName]) {
    bridgeList[bridgeName] = {
      ...bridgeList[bridgeName],
      ...actions
    };
  } else {
    // 注册bridge
    bridgeList[bridgeName] = actions;
  }
};
// 删除Bridge
export const deleteBridge = (bridgeName:string) => {
  delete bridgeList[bridgeName];
};

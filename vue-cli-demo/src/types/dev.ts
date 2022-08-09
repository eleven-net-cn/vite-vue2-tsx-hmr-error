export interface DevServer {
  baseURL: string;
  protocol: 'http' | 'https';
}

export interface InterceptedComp {
  cnt: number;
  compName: string;
  devCompName: string;
  version: string;
}

export interface ModuleDevState {
  devCompType: 'component' | 'page';
  enabled: boolean;
  error: any;
  interceptedComps: Record<string, InterceptedComp>;
  server: DevServer;
  websocket: any;
  _interceptingComps: Pick<InterceptedComp, 'compName' | 'devCompName'>;
}

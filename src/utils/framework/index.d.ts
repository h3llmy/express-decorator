// Declare a new property 'user' of type 'any' in the 'Request' interface within the 'Express' namespace.
declare namespace Express {
  interface Request {
    user?: any;
  }
}

declare interface IAppConfig {
  controllerPath?: string;
  baseUrl?: string;
  logRouteList?: boolean;
}

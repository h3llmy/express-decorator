import { RequestHandler } from "express";

export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}
export interface IControllerDecorator {
  (basePath?: string): ClassDecorator;
}
export interface IRouteDecorator {
  (path?: string): MethodDecorator;
}
export interface IMiddlewareDecorator {
  (...middleware: RequestHandler[]): ClassDecorator & MethodDecorator;
}
export type ParameterDecoratorType =
  | "body"
  | "params"
  | "query"
  | "file"
  | "user";

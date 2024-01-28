import { RequestHandler } from "express";

export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}
export type ControllerDecorator = (basePath?: string) => ClassDecorator;

export type RouteDecorator = (path?: string) => MethodDecorator;

export type MiddlewareDecorator = (
  ...middleware: RequestHandler[]
) => ClassDecorator & MethodDecorator;

export type ParameterDecoratorType =
  | "body"
  | "params"
  | "query"
  | "file"
  | "user";

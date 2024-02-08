import { RequestHandler } from "express";

/**
 * Enum representing HTTP methods for routes.
 */
export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  OPTIONS = "options",
  DELETE = "delete",
}

/**
 * Type definition for a class decorator used for marking a class as a controller.
 * @param basePath - The base path for all routes defined in the controller.
 * @returns A class decorator function.
 */
export type ControllerDecorator = (basePath?: string) => ClassDecorator;

/**
 * Type definition for a method decorator used for defining routes in a controller.
 * @param path - The path for the specific route.
 * @returns A method decorator function.
 */
export type RouteDecorator = (
  path?: string,
  sucessStatusCode?: number
) => MethodDecorator;

/**
 * Type definition for a decorator used for applying middleware to controllers or specific routes.
 * @param middleware - Express middleware functions to be applied.
 * @returns A decorator that can be applied to classes (controllers) or methods (routes).
 */
export type MiddlewareDecorator = (
  ...middleware: RequestHandler[]
) => ClassDecorator & MethodDecorator;

/**
 * Type definition for different parameter decorator types used for extracting data from requests.
 */
export type ParameterDecoratorType =
  | "body"
  | "params"
  | "query"
  | "file"
  | "user"
  | "headers";

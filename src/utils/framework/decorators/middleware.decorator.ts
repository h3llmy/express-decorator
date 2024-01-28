import "reflect-metadata";
import { IMiddlewareDecorator } from "./interface";

export const Middleware: IMiddlewareDecorator = (...middleware) => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (propertyKey && descriptor) {
      const existingMiddleware =
        Reflect.getMetadata("middleware", target, propertyKey) || [];
      const combinedMiddleware = [...existingMiddleware, ...middleware];
      Reflect.defineMetadata(
        "middleware",
        combinedMiddleware,
        target,
        propertyKey
      );
      return descriptor;
    } else {
      Reflect.defineMetadata("middleware", middleware, target.prototype);
      return target;
    }
  };
};

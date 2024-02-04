import "reflect-metadata";
import { MiddlewareDecorator } from "./interface";

/**
 * Decorator for applying middleware to controllers or specific routes.
 * @param middleware - Express middleware functions to be applied.
 * @returns A decorator that can be applied to classes (controllers) or methods (routes).
 */
export const Middleware: MiddlewareDecorator = (...middleware) => {
  /**
   * Decorator function applied to either a class (controller) or a method (route).
   * @param target - The target class or prototype (if applied to a class).
   * @param propertyKey - The name of the decorated method (if applied to a method).
   * @param descriptor - The descriptor of the decorated method (if applied to a method).
   * @returns The modified descriptor (if applied to a method) or the original target (if applied to a class).
   */
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (propertyKey && descriptor) {
      // Applied to a method (route)
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
      // Applied to a class (controller)
      Reflect.defineMetadata("middleware", middleware, target.prototype);
      return target;
    }
  };
};

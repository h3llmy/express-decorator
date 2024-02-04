import "reflect-metadata";
import { ControllerDecorator } from "./interface";

/**
 * Decorator for marking a class as a controller.
 * @param basePath - The base path for all routes defined in the controller.
 * @returns A class decorator function.
 */
export const Controller: ControllerDecorator = (basePath = "") => {
  /**
   * Class decorator function.
   * @param target - The target class.
   */
  return (target: Function) => {
    // Define metadata for the base path on the target class
    Reflect.defineMetadata("basePath", basePath, target);
  };
};

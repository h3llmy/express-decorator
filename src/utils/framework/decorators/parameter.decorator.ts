import ControllerRegistry from "../helper/controllerRegistry";
import { ParameterDecoratorType } from "./interface";

/**
 * Factory function for creating parameter decorators.
 * @param type - The type of the parameter decorator (e.g., "body", "params", "query", "file", "user", "headers").
 * @param modified - A boolean indicating whether the parameter has been modified.
 * @returns A parameter decorator function.
 */
function parameterDecoratorFactory(
  type: ParameterDecoratorType,
  modified: boolean = false
) {
  /**
   * Parameter decorator function.
   * @returns A decorator function to be applied to class methods.
   */
  return (): ParameterDecorator => {
    /**
     * Decorator function applied to method parameters.
     * @param target - The target class or prototype.
     * @param propertyKey - The name of the decorated method.
     * @param parameterIndex - The index of the decorated parameter.
     */
    return function (
      target: Object,
      propertyKey: string | symbol,
      parameterIndex: number
    ) {
      // Register the parameter decorator in the ControllerRegistry with the modified flag
      ControllerRegistry.registerParameterDecorator(
        target,
        propertyKey,
        parameterIndex,
        type,
        modified
      );
    };
  };
}

/**
 * Parameter decorator for extracting data from the request body.
 */
export const Body = parameterDecoratorFactory("body");

/**
 * Parameter decorator for extracting data from route parameters.
 */
export const Params = parameterDecoratorFactory("params", true);

/**
 * Parameter decorator for extracting data from query parameters.
 */
export const Query = parameterDecoratorFactory("query", true);

/**
 * Parameter decorator for extracting Headers data.
 */
export const Headers = parameterDecoratorFactory("headers", true);

/**
 * Parameter decorator for handling file uploads.
 */
export const File = parameterDecoratorFactory("file");

/**
 * Parameter decorator for extracting user-related data.
 */
export const User = parameterDecoratorFactory("user");

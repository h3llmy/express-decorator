import "reflect-metadata";
import { HttpMethod, RouteDecorator } from "./interface";
import { NextFunction, Request, Response } from "express";
import ControllerRegistry from "../helper/controllerRegistry";
import { plainToInstance } from "class-transformer";
import { ValidationError, validate } from "class-validator";
import convertObjectToNumbers from "../helper/convertNumberableObject";

/**
 * Asynchronously transforms and validates data based on the provided type.
 * @param paramType - The type of the parameter to be transformed and validated.
 * @param data - The data to be transformed and validated.
 * @returns A Promise resolving to the transformed and validated data.
 * @throws An object representing validation errors if validation fails.
 */
async function transformAndValidate(
  paramType: any,
  data: any,
  type: string
): Promise<any> {
  if (/^\s*class/.test(paramType.toString())) {
    const dto: object = plainToInstance(paramType, data);
    const errors: ValidationError[] = await validate(dto);

    if (errors.length > 0) {
      const transformedObject = { message: "validation error", field: {} };

      errors.forEach((item) => {
        const { property, constraints } = item;
        const constraintEntries = Object.entries(constraints).map(
          ([key, value]) => value
        );
        transformedObject.field[property] = constraintEntries;
      });

      throw transformedObject;
    }

    return dto;
  } else {
    return data;
  }
}

/**
 * Extracts request data based on parameter decorators and applies transformations.
 * @param target - The target class or prototype.
 * @param propertyKey - The name of the decorated method.
 * @param descriptor - The descriptor of the decorated method.
 * @returns The modified descriptor with request data extraction logic.
 */
function ExtractRequestData(
  target: Object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  const paramTypes = Reflect.getMetadata(
    "design:paramtypes",
    target,
    propertyKey
  );

  // console.log(paramTypes[0]("ajsdlajldsjalsdjalsdj"));
  // console.log(typeof paramTypes[0]());

  descriptor.value = async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const parameterDecorators = ControllerRegistry.getParameterDecorators(
      target,
      propertyKey
    );

    if (!parameterDecorators) {
      return originalMethod.call(this, req);
    }

    const args: any[] = [];
    let errorValidations = { message: "validation error", field: {} };
    for (const [index, parameter] of parameterDecorators) {
      try {
        const convertedRequest = parameter.modified
          ? convertObjectToNumbers(req[parameter.type])
          : req[parameter.type];

        args[index] = await transformAndValidate(
          paramTypes[index],
          convertedRequest,
          parameter.type
        );
      } catch (error) {
        if (error.message === "validation error") {
          errorValidations.field[parameter.type] = error.field;
        } else {
          throw error;
        }
      }
    }
    if (Object.keys(errorValidations.field).length > 0) {
      throw errorValidations;
    }

    const result = await originalMethod.call(this, ...args);
    return result;
  };

  return descriptor;
}

/**
 * Factory function for creating route decorators.
 * @param method - The HTTP method for the route (e.g., GET, POST, PUT, PATCH, DELETE).
 * @returns A route decorator function.
 */
const routeDecoratorFactory =
  (method: HttpMethod): RouteDecorator =>
  (path = "", statusCode = 200) => {
    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) => {
      // Define metadata for route path and HTTP method on the target method
      Reflect.defineMetadata("path", path, target, propertyKey);
      Reflect.defineMetadata("method", method, target, propertyKey);
      Reflect.defineMetadata("statusCode", statusCode, target, propertyKey);

      // Apply ExtractRequestData decorator to handle parameter extraction and transformation
      return ExtractRequestData(target, propertyKey, descriptor);
    };
  };

/**
 * Route decorator for defining a GET endpoint.
 */
export const Get: RouteDecorator = routeDecoratorFactory(HttpMethod.GET);

/**
 * Route decorator for defining a POST endpoint.
 */
export const Post: RouteDecorator = routeDecoratorFactory(HttpMethod.POST);

/**
 * Route decorator for defining a PUT endpoint.
 */
export const Put: RouteDecorator = routeDecoratorFactory(HttpMethod.PUT);

/**
 * Route decorator for defining a PATCH endpoint.
 */
export const Patch: RouteDecorator = routeDecoratorFactory(HttpMethod.PATCH);

/**
 * Route decorator for defining a OPTIONS endpoint.
 */
export const Options: RouteDecorator = routeDecoratorFactory(
  HttpMethod.OPTIONS
);

/**
 * Route decorator for defining a DELETE endpoint.
 */
export const Delete: RouteDecorator = routeDecoratorFactory(HttpMethod.DELETE);

import "reflect-metadata";
import { HttpMethod, IRouteDecorator } from "./interface";
import { NextFunction, Request, Response } from "express";
import ControllerRegistry from "../helper/controllerRegistry";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

const routeDecoratorFactory =
  (method: HttpMethod): IRouteDecorator =>
  (path = "") => {
    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) => {
      Reflect.defineMetadata("path", path, target, propertyKey);
      Reflect.defineMetadata("method", method, target, propertyKey);

      return ExtractRequestData(target, propertyKey, descriptor);
    };
  };

async function transformAndValidate(
  type: string,
  paramType: any,
  data: any
): Promise<any> {
  if (/^\s*class/.test(paramType.toString())) {
    const dto: object = plainToClass(paramType, data);
    const errors = await validate(dto);
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
    for (const [index, type] of parameterDecorators) {
      args[index] = await transformAndValidate(
        type,
        paramTypes[index],
        req[type]
      );
    }

    const result = await originalMethod.call(this, ...args);
    return result;
  };

  return descriptor;
}

export const Get: IRouteDecorator = routeDecoratorFactory(HttpMethod.GET);
export const Post: IRouteDecorator = routeDecoratorFactory(HttpMethod.POST);
export const Put: IRouteDecorator = routeDecoratorFactory(HttpMethod.PUT);
export const Patch: IRouteDecorator = routeDecoratorFactory(HttpMethod.PATCH);
export const Delete: IRouteDecorator = routeDecoratorFactory(HttpMethod.DELETE);

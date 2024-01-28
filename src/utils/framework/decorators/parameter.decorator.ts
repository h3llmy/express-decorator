import ControllerRegistry from "../helper/controllerRegistry";
import { ParameterDecoratorType } from "./interface";

function parameterDecoratorFactory(type: ParameterDecoratorType) {
  return (): ParameterDecorator => {
    return function (
      target: Object,
      propertyKey: string | symbol,
      parameterIndex: number
    ) {
      ControllerRegistry.registerParameterDecorator(
        target,
        propertyKey,
        parameterIndex,
        type
      );
    };
  };
}

export const Body = parameterDecoratorFactory("body");
export const Params = parameterDecoratorFactory("params");
export const Query = parameterDecoratorFactory("query");
export const File = parameterDecoratorFactory("file");
export const User = parameterDecoratorFactory("user");

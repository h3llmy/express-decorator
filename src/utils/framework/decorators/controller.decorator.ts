import "reflect-metadata";
import { IControllerDecorator } from "./interface";

export const Controller: IControllerDecorator = (basePath = "") => {
  return (target: Function) => {
    Reflect.defineMetadata("basePath", basePath, target);
  };
};

import "reflect-metadata";
import { ControllerDecorator } from "./interface";

export const Controller: ControllerDecorator = (basePath = "") => {
  return (target: Function) => {
    Reflect.defineMetadata("basePath", basePath, target);
  };
};

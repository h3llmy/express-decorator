import appConfig from "../config/app.config";
import express, { Express, RequestHandler, Request, Response } from "express";
import glob from "glob";
import "reflect-metadata";
import { ControllerMethod } from "./interface";
import fileUpload from "express-fileupload";
import { ValidationError } from "class-validator";

class App {
  private readonly app: Express;
  private readonly port: number;
  private readonly controllers: string[];

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.controllers = glob.sync(appConfig.structure.controllerPath);
  }

  private defaultMiddleware(): void {
    this.app.use(express.json());
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
      })
    );
  }

  public registerMiddleware(...middleware: RequestHandler[]): void {
    this.app.use(...middleware);
  }

  private async loadControllers(): Promise<void> {
    for (const controllerPath of this.controllers) {
      const module = await import(
        controllerPath.replace("src/", "../").replace(".ts", "")
      );

      const controllerClass = module.default;

      if (controllerClass) {
        const controllerInstance: Object = new controllerClass();
        this.registerControllerRoutes(controllerInstance);
      }
    }
  }

  private registerControllerRoutes(controllerInstance: Object): void {
    const basePath = Reflect.getMetadata(
      "basePath",
      controllerInstance.constructor
    );
    const methodNames = Object.getOwnPropertyNames(
      Object.getPrototypeOf(controllerInstance)
    ).filter((property) => property !== "constructor");

    for (const methodName of methodNames) {
      const methodPath: string = Reflect.getMetadata(
        "path",
        controllerInstance,
        methodName
      );
      const httpMethod: string = Reflect.getMetadata(
        "method",
        controllerInstance,
        methodName
      );

      const routeMiddleware: RequestHandler[] | undefined = Reflect.getMetadata(
        "middleware",
        controllerInstance
      );

      const methodMiddleware: RequestHandler[] | undefined =
        Reflect.getMetadata("middleware", controllerInstance, methodName);

      const fullPath = `${appConfig.api.baseUrl ?? ""}${
        basePath ?? ""
      }${methodPath}`;

      const routeHandlers: RequestHandler[] = [
        ...(routeMiddleware || []),
        ...(methodMiddleware || []),
        this.controllerHandling(
          controllerInstance[methodName] as ControllerMethod
        ),
      ];

      this.app[httpMethod](fullPath, routeHandlers);

      console.log(`Registered route: ${httpMethod.toUpperCase()} ${fullPath}`);
    }
  }

  private controllerHandling(
    controllerMethod: ControllerMethod
  ): RequestHandler {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        const httpResponse = await controllerMethod(req);
        res.json(httpResponse);
      } catch (error) {
        if (error.message === "validation error") {
          res.status(400).json(error);
        } else {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    };
  }

  public async start(): Promise<void> {
    this.defaultMiddleware();
    await this.loadControllers();
    this.app.listen(this.port, () =>
      console.log(`App is listening at http://localhost:${this.port}`)
    );
  }
}

export default App;

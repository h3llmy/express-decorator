import appConfig from "../config/app.config";
import express, {
  Express,
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import glob from "glob";
import "reflect-metadata";
import fileUpload from "express-fileupload";
import cors from "cors";
import { HttpMethod } from "utils/framework/decorators/interface";

class App {
  private readonly app: Express;
  private readonly port: number;
  private readonly controllers: string[] = glob.sync(
    appConfig.structure.controllerPath
  );
  private readonly defaultMiddleware = [
    express.json(),
    cors(),
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    }),
  ];

  private globalErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }

  private readonly controllerHandling =
    (controllerMethod: any, methodName: string): RequestHandler =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const httpResponse = await controllerMethod[methodName](req);
        res.json(httpResponse);
      } catch (error) {
        if (error.message === "validation error") {
          res.status(400).json(error);
        } else {
          next(error);
        }
      }
    };

  constructor(port: number) {
    this.app = express();
    this.port = port;
  }

  private async loadControllers(): Promise<void> {
    await Promise.all(
      this.controllers.map(async (controllerPath) => {
        const module = await import(
          controllerPath.replace("src/", "../").replace(".ts", "")
        );

        const controllerClass = module.default;

        if (controllerClass) {
          const controllerInstance: any = new controllerClass();
          this.registerControllerRoutes(controllerInstance);
        }
      })
    );
  }

  private registerControllerRoutes(controllerInstance: any): void {
    const basePath: string = Reflect.getMetadata(
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
      const httpMethod: HttpMethod = Reflect.getMetadata(
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

      if (methodPath && httpMethod) {
        const fullPath = `${appConfig.api.baseUrl ?? ""}${
          basePath ?? ""
        }${methodPath}`;

        const routeHandlers: RequestHandler[] = [
          ...(routeMiddleware || []),
          ...(methodMiddleware || []),
          this.controllerHandling(controllerInstance, methodName),
        ];

        this.app[httpMethod](fullPath, routeHandlers);
      }
    }
  }

  public async start(): Promise<void> {
    this.app.use(...this.defaultMiddleware);
    await this.loadControllers();
    this.app.use(this.globalErrorHandler);
    this.app.listen(this.port, () =>
      console.log(`App is listening at http://localhost:${this.port}`)
    );
  }
}

export default App;

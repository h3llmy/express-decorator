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

/**
 * The `App` class represents the main application server.
 * It is responsible for configuring the Express application,
 * loading controllers dynamically, and starting the server.
 */
class App {
  /**
   * The Express application instance.
   */
  private readonly app: Express;

  /**
   * An array of file paths to controller classes.
   * These controllers will be dynamically loaded.
   */
  private readonly controllers: string[] = glob.sync(
    appConfig.structure.controllerPath
  );

  /**
   * The default middleware stack for the Express application.
   * It includes JSON parsing, CORS handling, and file uploading configuration.
   */
  private readonly defaultMiddleware: RequestHandler[] = [
    express.json(),
    cors(),
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    }),
  ];

  /**
   * Creates an instance of the `App` class.
   */
  constructor() {
    this.app = express();
  }

  /**
   * Global error handler for handling uncaught errors during request processing.
   * @param err - The error object.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The Express next function.
   */
  private globalErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }

  /**
   * Handles controller methods by invoking them and sending the response.
   * @param controllerInstance - An instance of a controller class.
   * @param methodName - The name of the method to be invoked.
   */
  private readonly controllerHandling =
    (controllerInstance: Object, methodName: string): RequestHandler =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const httpResponse = await controllerInstance[methodName](req);
        const sucessStatusCode: number = Reflect.getMetadata(
          "statusCode",
          controllerInstance,
          methodName
        );

        res.status(sucessStatusCode).json(httpResponse);
      } catch (error) {
        if (error.message === "validation error") {
          res.status(400).json(error);
        } else {
          next(error);
        }
      }
    };

  /**
   * Dynamically loads controllers and registers their routes.
   */
  private async loadControllers(): Promise<void> {
    await Promise.all(
      this.controllers.map(async (controllerPath) => {
        const module = await import(
          controllerPath.replace("src/", "../").replace(".ts", "")
        );

        const controllerClass = module.default;

        if (controllerClass) {
          const controllerInstance: Object = new controllerClass();
          const isController: boolean | undefined = Reflect.getMetadata(
            "isController",
            controllerInstance.constructor
          );

          if (isController) {
            this.registerControllerRoutes(controllerInstance);
          }
        }
      })
    );
  }

  /**
   * Registers routes for the methods of a controller class.
   * @param controllerInstance - An instance of a controller class.
   */
  private registerControllerRoutes(controllerInstance: Object): void {
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

  /**
   * Adds global middleware to the default middleware stack.
   * @param middleware - Express middleware functions to be added.
   */
  public setGlobalMiddleware(...middleware: RequestHandler[]): void {
    this.defaultMiddleware.push(...middleware);
  }

  /**
   * Starts the server by configuring middleware, loading controllers, and listening on the specified port.
   * @param port - The port on which the server will listen.
   */
  public async start(port: number): Promise<void> {
    this.app.use(...this.defaultMiddleware);
    await this.loadControllers();
    this.app.use(this.globalErrorHandler);
    this.app.listen(port, () =>
      console.log(`App is listening at http://localhost:${port}`)
    );
  }
}

export default App;

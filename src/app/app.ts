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
import { HttpMethod } from "../utils/framework/decorators/interface";

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
   * Default configuration options for the application.
   */
  private readonly appConfig: IAppConfig = {
    controllerPath: "src/module/**/*.controller.ts",
    baseUrl: "/api/v1",
    logRouteList: false,
  };

  /**
   * An array of file paths to controller classes.
   * These controllers will be dynamically loaded.
   */
  private readonly controllers: string[] = glob.sync(
    this.appConfig.controllerPath
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
   *
   * @param {IAppConfig} [config] - The configuration options for the application.
   * @description
   * Initializes a new instance of the `App` class with the provided configuration options.
   * If no configuration is provided, default values will be used.
   */
  constructor(config?: IAppConfig) {
    this.app = express();
    this.appConfig = { ...this.appConfig, ...config };
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
        const successStatusCode: number = Reflect.getMetadata(
          "statusCode",
          controllerInstance,
          methodName
        );

        res.status(successStatusCode).json(httpResponse);
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
    if (this.controllers) {
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
        const fullPath = `${this.appConfig.baseUrl ?? ""}${
          basePath ?? ""
        }${methodPath}`;

        const routeHandlers: RequestHandler[] = [
          ...(routeMiddleware || []),
          ...(methodMiddleware || []),
          this.controllerHandling(controllerInstance, methodName),
        ];

        this.app[httpMethod](fullPath, routeHandlers);

        this.routeLogger(httpMethod, fullPath);
      }
    }
  }

  /**
   * Logs information about a registered route with colorized HTTP method.
   * @param {HttpMethod} httpMethod - The HTTP method of the route.
   * @param {string} fullPath - The full path of the route.
   * @private
   */
  private routeLogger(httpMethod: HttpMethod, fullPath: string): void {
    const colors = {
      GET: "\x1b[32m",
      POST: "\x1b[34m",
      PUT: "\x1b[33m",
      DELETE: "\x1b[31m",
      RESET: "\x1b[0m",
    };

    const upperCaseMethodName = httpMethod.toUpperCase();
    if (this.appConfig.logRouteList) {
      console.log(
        `Route: ${colors[upperCaseMethodName]}${upperCaseMethodName}${colors.RESET} ${fullPath}`
      );
    }
  }

  /**
   * check application status
   */
  private healthCheck(): void {
    this.app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "ok" });
    });
  }

  /**
   * Adds global middleware to the default middleware stack.
   * @param middleware - Express middleware functions to be added.
   */
  public setGlobalMiddleware(...middleware: RequestHandler[]): void {
    this.defaultMiddleware.push(...middleware);
  }

  /**
   * Gets the Express server instance.
   *
   * @returns {Express} The Express server instance.
   */
  public getServer(): Express {
    return this.app;
  }
  /**
   * Starts the server by configuring middleware, loading controllers, and listening on the specified port.
   * @param port - The port on which the server will listen.
   */
  public async start(port: number): Promise<void> {
    this.healthCheck();
    this.app.use(...this.defaultMiddleware);
    await this.loadControllers();
    this.app.use(this.globalErrorHandler);
    this.app.listen(port, () =>
      console.log(`App is listening at http://localhost:${port}`)
    );
  }
}

export default App;

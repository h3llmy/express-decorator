import { NextFunction, Request, RequestHandler, Response } from "express";

class TestMiddleware {
  static test(name: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      console.log(name);
      next();
    };
  }

  static mantap(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      console.log("joss");
      next();
    };
  }
}
export default TestMiddleware;

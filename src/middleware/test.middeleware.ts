import { NextFunction, Request, Response } from "express";

class TestMiddleware {
  static test(name: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      console.log(name);
      next();
    };
  }

  static mantap() {
    return async (req: Request, res: Response, next: NextFunction) => {
      console.log("joss");
      next();
    };
  }
}
export default TestMiddleware;

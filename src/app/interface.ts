import { Request } from "express";

export type ControllerMethod = (req: Request) => Promise<any>;

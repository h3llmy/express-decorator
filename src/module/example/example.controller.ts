import { Controller } from "../../utils/framework/decorators/controller.decorator";
import {
  Delete,
  Get,
  Post,
  Put,
} from "../../utils/framework/decorators/route.decorator";
import {
  Body,
  File,
  Params,
  Query,
} from "../../utils/framework/decorators/parameter.decorator";
import { JossBody, JossQuery } from "./request/jossBody";
import ExampleService from "./example.service";
import { Middleware } from "../../utils/framework/decorators/middleware.decorator";
import TestMiddleware from "../../middleware/test.middeleware";

@Controller("/example")
export default class ExampleController {
  @Get("/", 201)
  public testing() {
    return ExampleService.test("aselole");
  }
  @Get("/:id")
  public helloRoute(@Params() params: number) {
    return { params };
  }
  @Post("/")
  @Middleware(TestMiddleware.test("mantap"))
  public helloWorld(
    @Body() requestBody: JossBody,
    @Query() requestQuery: JossQuery
  ) {
    return { requestBody, requestQuery };
  }
  @Put("/:id")
  public helloTest(@Params() params: any, @File() file: any) {
    return params;
  }
  @Delete("/:id")
  public delete(@Params() params: any) {
    return params;
  }
}

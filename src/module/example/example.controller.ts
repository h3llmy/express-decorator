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
import TestMiddleware from "../../middleware/test.middleware";
import { Inject } from "../../utils/framework/decorators/injection.decorator";

@Controller("/example")
export default class ExampleController {
  @Inject()
  private exampleService: ExampleService;

  @Get("/", 200)
  public testing() {
    return this.exampleService.test("my name is helmi");
  }

  @Get("/:id")
  public helloRoute(@Params() params: number) {
    return { params };
  }

  @Post("/", 201)
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

import { Controller } from "../../utils/framework/decorators/controller.decorator";
import {
  Get,
  Post,
  Put,
} from "../../utils/framework/decorators/route.decorator";
import {
  Body,
  File,
  Params,
  Query,
  User,
} from "../../utils/framework/decorators/parameter.decorator";
import ExampleService from "./example.service";
import { JossBody } from "./request/jossBody";
import { Middleware } from "../../utils/framework/decorators/middleware.decorator";
import TestMiddleware from "../../middleware/test.middeleware";

@Controller("/example")
@Middleware(TestMiddleware.mantap())
export default class ExampleController {
  private exampleService = new ExampleService();
  @Get("/route/:id")
  public helloRoute(@Params() params: any, @Query() query: any) {
    return { params, query };
  }

  @Post("/joss")
  @Middleware(TestMiddleware.test("testing route middleware"))
  public helloWorld(@Body() requestBody: JossBody) {
    return requestBody;
  }

  @Put("/test")
  public helloTest(@User() user: any, @File() file: any) {
    return user;
  }
}

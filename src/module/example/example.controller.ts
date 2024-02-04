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
import { JossBody } from "./request/jossBody";
import ExampleService from "./example.service";

@Controller("/example")
export default class ExampleController {
  constructor(private readonly test: any) {}

  @Get("/")
  public testing() {
    return ExampleService.test("aselole");
  }

  @Get("/:id")
  public helloRoute(@Params() params: any, @Query() query: any) {
    return { params, query };
  }

  @Post("/")
  public helloWorld(@Body() requestBody: JossBody) {
    return requestBody;
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

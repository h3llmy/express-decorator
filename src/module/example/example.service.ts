import { Inject } from "../../utils/framework/decorators/injection.decorator";
import SomeService from "./some.service";

export default class ExampleService {
  @Inject()
  private otherService: SomeService;

  public test(name: string) {
    return this.otherService.kontol(name);
  }
}

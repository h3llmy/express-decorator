import { Service } from "utils/framework/decorators/injectable";

export default class ExampleService {
  public test(name: string) {
    return `hello ${name}`;
  }
}

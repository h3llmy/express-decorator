import { Service } from "utils/framework/decorators/injectable";

export default class ExampleService {
  static test(name: string) {
    return `hello ${name}`;
  }
}

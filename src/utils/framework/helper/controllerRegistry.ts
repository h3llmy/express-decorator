export default class ControllerRegistry {
  private static parameterDecorators: Map<
    string | symbol,
    Map<number, string>
  > = new Map();

  public static registerParameterDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
    type: string
  ) {
    if (!this.parameterDecorators.has(propertyKey)) {
      this.parameterDecorators.set(propertyKey, new Map());
    }

    this.parameterDecorators.get(propertyKey)!.set(parameterIndex, type);
  }

  public static getParameterDecorators(
    target: Object,
    propertyKey: string | symbol
  ): Map<number, string> | undefined {
    return this.parameterDecorators.get(propertyKey);
  }
}

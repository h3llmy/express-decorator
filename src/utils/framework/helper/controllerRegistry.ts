/**
 * A registry class for storing and retrieving parameter decorators used in controllers.
 */
export default class ControllerRegistry {
  /**
   * Map to store parameter decorators for each method in a controller.
   * The outer map's key is the method name, and the inner map's key is the parameter index.
   */
  private static parameterDecorators: Map<
    string | symbol,
    Map<number, string>
  > = new Map();

  /**
   * Registers a parameter decorator for a specific method and parameter index.
   * @param target - The target class or prototype containing the decorated method.
   * @param propertyKey - The name of the decorated method.
   * @param parameterIndex - The index of the decorated parameter.
   * @param type - The type of the parameter decorator.
   */
  public static registerParameterDecorator(
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
    type: string
  ): void {
    // Ensure there is an entry for the method in the outer map
    if (!this.parameterDecorators.has(propertyKey)) {
      this.parameterDecorators.set(propertyKey, new Map());
    }

    // Set the parameter decorator type in the inner map for the specified parameter index
    this.parameterDecorators.get(propertyKey)!.set(parameterIndex, type);
  }

  /**
   * Retrieves parameter decorators for a specific method.
   * @param target - The target class or prototype containing the decorated method.
   * @param propertyKey - The name of the decorated method.
   * @returns A map containing parameter indexes and their corresponding decorator types.
   *          Returns undefined if no parameter decorators are registered for the method.
   */
  public static getParameterDecorators(
    target: Object,
    propertyKey: string | symbol
  ): Map<number, string> | undefined {
    return this.parameterDecorators.get(propertyKey);
  }
}

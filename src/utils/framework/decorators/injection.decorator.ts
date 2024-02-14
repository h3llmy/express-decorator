/**
 * Decorator for dependency injection.
 * Creates an instance of the specified service type and injects it into the property.
 *
 * @returns {Function} The decorator function.
 */
export const Inject = () => (target: Object, key: string) => {
  // Get the type of the property
  const type = Reflect.getMetadata("design:type", target, key);

  // Check if the type is a class (constructor function)
  if (typeof type === "function" && type.prototype) {
    // Create an instance of the service and assign it to the property
    const serviceInstance: object = new type();
    target[key] = serviceInstance;

    // Add metadata to the class
    Reflect.defineMetadata("serviceType", type, target);
  } else {
    throw new Error(
      "Inject decorator error: The type of ${key} is not a class."
    );
  }
};

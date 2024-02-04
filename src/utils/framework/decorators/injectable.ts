export const Service = (): ClassDecorator => {
  return (target: any) => {
    // You can perform additional setup or metadata storage here if needed
    Reflect.defineMetadata("service", true, target);
  };
};

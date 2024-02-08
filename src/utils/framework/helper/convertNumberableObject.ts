import { ConvertibleObject } from "./interface";

export default function convertObjectToNumbers(
  obj: ConvertibleObject
): ConvertibleObject {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === "object" && value !== null) {
        obj[key] = convertObjectToNumbers(value);
      } else if (typeof value === "string" && !isNaN(Number(value))) {
        obj[key] = parseFloat(value);
      }
    }
  }

  return obj;
}

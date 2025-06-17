// importamos los tipos de Request y Response
import type { Request, Response, NextFunction } from "express";
// importamos la función validationResult
import { validationResult } from "express-validator";

export const handleInputErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let errors = validationResult(req); // los errores van a estar en el resultado de la validación
  if (!errors.isEmpty()) {
    // si hay errores, devolvemos un 400 con los errores
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next(); // si no hay errores, continuamos con la siguiente ruta
};

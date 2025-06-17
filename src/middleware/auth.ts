// importamos los tipos de Request y Response
import type { Request, Response, NextFunction } from "express";
// importamos la dependencia de JWT
import jwt from "jsonwebtoken";
// importamos el modelo User y su interfaz
import User, { IUser } from "../models/User";

// declaramos el tipo de la propiedad user en el Request de manera global (para todos los requests) (typescript )
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // definimos la propiedad user en el Request de manera global (para todos los requests)
    }
  }
}

// declaramos la función de middleware que valida si el token de sesión es válido
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // guardamos el token de sesión en la variable bearer
  const bearer = req.headers.authorization;
  // si el token no existe, devolvemos un error
  if (!bearer) {
    const error = new Error("No autorizado");
    res.status(401).json({ error: error.message });
    return;
  }

  // extraemos el token de la cadena de caracteres
  const token = bearer.split(" ")[1];

  // verificamos si el token es válido
  try {
    // guardamos el token en la variable decoded
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // guardamos el usuario
    if (typeof decoded === "object" && decoded.id) {
      const user = await User.findById(decoded.id).select("_id name email");
      // si el usuario existe, devolvemos el usuario
      if (user) {
        req.user = user;
        next();
      } // si el usuario no existe, devolvemos un error
      else {
        res.status(500).json({ error: "Token no válido" }); // el error es que la cuenta no existe, pero devolvemos este error para no dar información sensible
        return;
      }
    }
  } catch (error) {
    // si el token no es válido, devolvemos un error
    res.status(500).json({ error: "Token no válido" });
    return;
  }
};

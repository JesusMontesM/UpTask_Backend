// importamos jwt para los token de sesión
import jwt from "jsonwebtoken";
// importamos los types de mongoose
import Types from "mongoose";

// creamos un type para el token de sesión
type UserPayload = {
  id: Types.ObjectId;
};

// creamos una función para generar un token de sesión
export const generateJWT = (payload: UserPayload) => {
  // creamos un token de sesión
  // coge como parametros los datos que le pasemos, el secret de la aplicación y la cantidad de tiempo que durará el token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "180d", // 180 días
  });
  // devolvemos el token
  return token;
};

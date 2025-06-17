// Mongoose es una librería que nos permite modelar y gestionar datos en MongoDB de forma sencilla.
// Schema es la estructura o plantilla que define cómo serán los documentos en la base de datos.
// Document es una interfaz que representa un documento individual en MongoDB y permite el tipado con TypeScript.
import mongoose, { Schema, Document, Types } from "mongoose";

// Definimos una interfaz IToken que extiende de Document para tipar nuestro modelo de token.
// Esto ayuda a TypeScript a entender qué propiedades tiene un usuario en nuestro sistema.
export interface IToken extends Document {
  token: string;
  // definimos el campo user como un objetoId de mongoose para asegurar que el token pertenece a un usuario específico
  user: Types.ObjectId;
  createdAt: Date;
}

// Creamos el esquema (estructura) para el modelo de token usando la clase Schema de mongoose.
// Aquí definimos qué campos tendrá cada token, su tipo y reglas de validación.
const tokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
  },
  expiresAt: {
    type: Date,
    // establecemos la fecha actual como la fecha de creación del token
    default: Date.now(),
    // establecemos el tiempo de expiración del token en 10 minutos
    expires: "10m",
  },
});

// Creamos el modelo de mongoose llamado "Token" basado en el esquema tokenSchema y tipado con IToken.
// Este modelo será usado para crear, leer, actualizar y eliminar tokens en la colección "token" de MongoDB.
const Token = mongoose.model<IToken>("Token", tokenSchema);

// Exportamos el modelo para usarlo en otras partes de la aplicación.
export default Token;

// Mongoose es una librería que nos permite modelar y gestionar datos en MongoDB de forma sencilla.
// Schema es la estructura o plantilla que define cómo serán los documentos en la base de datos.
// Document es una interfaz que representa un documento individual en MongoDB y permite el tipado con TypeScript.
import mongoose, { Schema, Document } from "mongoose";

// Definimos una interfaz IUser que extiende de Document para tipar nuestro modelo de usuario.
// Esto ayuda a TypeScript a entender qué propiedades tiene un usuario en nuestro sistema.
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  confirmed: boolean;
}

// Creamos el esquema (estructura) para el modelo de usuario usando la clase Schema de mongoose.
// Aquí definimos qué campos tendrá cada usuario, su tipo y reglas de validación.
const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true, // es obligatorio
    unique: true, // Debe ser único en la base de datos (no pueden haber dos usuarios con el mismo email)
    lowercase: true, // Convierte automáticamente el email a minúsculas para evitar duplicados por mayúsculas/minúsculas
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

// Creamos el modelo de mongoose llamado "User" basado en el esquema userSchema y tipado con IUser.
// Este modelo será usado para crear, leer, actualizar y eliminar usuarios en la colección "users" de MongoDB.
const User = mongoose.model<IUser>("User", userSchema);

// Exportamos el modelo para usarlo en otras partes de la aplicación.
export default User;

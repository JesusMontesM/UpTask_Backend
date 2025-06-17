// importamos mongoose
import mongoose from "mongoose";
// importamor colors para colorear la salida
import colors from "colors";
// importamos exit para salir del programa
import { exit } from "node:process";

// declaramos y exportamos la conexion a la base de datos
export const connectDB = async () => {
  try {
    // creamos una conexion a la base de datos
    const {connection} = await mongoose.connect(process.env.DATABASE_URL); // aplicamos destructoring a connection para obtener el objeto connection
    // imprimimos el mensaje de conexion
    console.log(
      colors.green.bold(`Conexion a la base de datos establecida con éxito`)
    );
    // definimos la url de la conexion
    const url = `${connection.host}:${connection.port}`;
    // imprimimos la conexion
    console.log(colors.magenta.bold(`MongoDB Conectado en: ${url}`));
  } catch (error) {
    // imprimimos el error
    console.log(
      colors.red.bold(`Error de conexion a MongoDB: ${error.message}`)
    );
    // salimos del programa con el código de error 1
    exit(1);
  }
};

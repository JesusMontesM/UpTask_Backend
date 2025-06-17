// importamos express
import express from "express";
// importamos dotenv para cargar variables de entorno
import dotenv from "dotenv";
// importamos cors y la configuración de cors
import cors from "cors";
// importamos morgan para registrar las peticiones
import morgan from "morgan";
import { corsConfig } from "./config/cors";
// importamos la conexion a la base de datos
import { connectDB } from "./config/db";
// importamos las rutas de autentificacion
import authRoutes from "./routes/authRoutes";
// importamos las rutas del rpoyecto
import projectRoutes from "./routes/projectRoutes";

// cargamos las variables de entorno
dotenv.config();
// nos conectamos a la base de datos
connectDB();
// creamos una variable para el servidor
const app = express();

// usamos cors
app.use(cors(corsConfig));

// usamos morgan para registrar las peticiones
app.use(morgan("dev"));

// Leer datos de formularios en el body de la petición
app.use(express.json()); // usamos el middleware json para leer los datos de formularios en el body de la petición

// declaramos las rutas
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("REST API funcionando");
});

// exportamos el servidor
export default app;

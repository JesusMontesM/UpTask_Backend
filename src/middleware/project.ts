// importamos los types de Request, Response y NextFunction para definir las funciones de middleware
import type { Request, Response, NextFunction } from "express";
// importamos el modelo Project y su interfaz
import Project, { IProject } from "../models/Proyect";

// declaramos el tipo de la propiedad project en el Request de manera global (para todos los requests) (typescript )
declare global {
  namespace Express {
    interface Request {
      project: IProject; // definimos la propiedad project en el Request de manera global (para todos los requests)
    }
  }
}

// declaramos la función de middleware que valida si el proyecto existe
export async function projectExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = req.params.projectId || req.params.id; // aplicamos destructuring al id
    const project = await Project.findById(projectId); // buscamos el proyecto con el id indicado en la base de datos
    if (!project) {
      const error = new Error("Proyecto no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }
    req.project = project; // establecemos el proyecto en la propiedad project del request
    next(); // llamamos al siguiente middleware
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el proyecto" });
  }
}

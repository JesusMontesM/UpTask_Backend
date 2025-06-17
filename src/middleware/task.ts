// importamos los types de Request, Response y NextFunction para definir las funciones de middleware
import type { Request, Response, NextFunction } from "express";
// importamos el modelo Project y su interfaz
import Task, { ITask } from "./../models/Task";

// declaramos el tipo de la propiedad project en el Request de manera global (para todos los requests) (typescript )
declare global {
  namespace Express {
    interface Request {
      task: ITask; // definimos la propiedad task en el Request de manera global (para todos los requests)
    }
  }
}

// declaramos la función de middleware que valida si la tarea existe
export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { TaskId } = req.params; // aplicamos destructuring al id
    const task = await Task.findById(TaskId); // buscamos la tarea con el id indicado en la base de datos
    if (!task) {
      const error = new Error("Tarea no encontrada");
      res.status(404).json({ error: error.message });
      return;
    }
    req.task = task; // establecemos la tarea en la propiedad task del request
    next(); // llamamos al siguiente middleware
  } catch (error) {
    res.status(500).json({ error: "Tarea no encontrada" });
  }
}

// declaramos la función de middleware que valida si la tarea pertenece al proyecto
export function taskBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.task.project.toString() !== req.project.id.toString()) {
      const error = new Error("Accion no valida");
      res.status(400).json({ error: error.message });
      return;
    }
    next(); // llamamos al siguiente middleware
  } catch (error) {
    res.status(500).json({ error: "Error al validar la tarea" });
  }
}

// declaramos la función de middleware que valida si el usuario actual es el manager del proyecto
export function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // si el usuario actual no es el manager del proyecto, devolvemos un error
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error("Accion no valida");
    res.status(400).json({ error: error.message });
    return;
  }
  next(); // llamamos al siguiente middleware
}

// importamos los types de Request y Response
import type { Request, Response } from "express";
// importamos el modelo task
import Task from "../models/Task";

// declaramos el controller TaskController
export class TaskController {
  // declaramos la funcionalidad de la ruta POST
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body); // creamos un nuevo task con los datos del body
      task.project = req.project.id; // establecemos el proyecto al que pertenece el task
      req.project.tasks.push(task.id); // agregamos el task al proyecto
      await Promise.allSettled([task.save(), req.project.save()]); // guardamos los datos en paralelo
      res.send("Tarea creada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Error al crear la tarea" });
    }
  };
  // declaramos la funcionalidad de la ruta GET
  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      // buscamos los tasks del proyecto, populate es para conseguir la informacion de los proyectos
      const taks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.send(taks);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las tareas" });
    }
  };
  // declaramos la funcionalidad de la ruta GET by Id
  static getTaskById = async (req: Request, res: Response) => {
    try {
      // buscamos la tarea con el id
      const task = await Task.findById(req.task.id)
        // decimos que nos llene el campo completedBy con el id, el nombre y el email
        .populate({ path: "completedBy.user", select: "_id email name" })
        // decimos que nos llene el campo notes con su informacion y la de createdBy con su id, el nombre y el email
        .populate({
          path: "notes",
          populate: { path: "createdBy", select: "_id name email" },
        });
      // enviamos la tarea
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Tarea no encontrada" });
    }
  };
  // declaramos la funcionalidad de la ruta PUT by Id
  static updateTask = async (req: Request, res: Response) => {
    try {
      req.task.name = req.body.name; // asignamos el nombre a la tarea
      req.task.description = req.body.description; // asignamos la descripcion a la tarea
      await req.task.save(); // guardamos los cambios en la base de datos
      res.send("Tarea actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar la tarea" });
    }
  };
  // declaramos la funcionalidad de la ruta DELETE by Id
  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id.toString()
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]); // guardamos los datos en paralelo
      res.send("Tarea eliminada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar la tarea" });
    }
  };
  // declaramos la funcionalidad de actualizar el estado de la tarea
  static updateStatus = async (req: Request, res: Response) => {
    try {
      // asignamos el estado de la tarea con los datos del body
      const { status } = req.body;
      // asignamos el estado a la tarea
      req.task.status = status;
      // almacenamos los datos de completedby en un objeto con el usuario y el estado
      const data = {
        user: req.user.id,
        status,
      };
      // agregamos los datos a completedBy
      req.task.completedBy.push(data);
      // guardamos los cambios en la base de datos
      await req.task.save();
      res.send("Estado actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el estado" });
    }
  };
}

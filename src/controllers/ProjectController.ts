// importamos los types de Request y Response
import type { Request, Response } from "express";
// importamos el modelo Project
import Project from "../models/Proyect";

// declaramos el controller
export class ProjectController {
  // declaramos la funcionalidad de la ruta POST
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body); // creamos un nuevo proyecto con los datos del body

    /** Asigna un manager al proyecto */
    project.manager = req.user.id;
    try {
      await project.save(); // guardamos el proyecto en la base de datos
      res.send("Proyecto creado correctamente");
    } catch (error) {
      console.log(error);
    }
  };
  // declaramos la funcionalidad de la ruta GET
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // buscamos todos los proyectos en la base de datos
      const projects = await Project.find({
        // filtramos los proyectos por el JWT
        $or: [
          // buscamos los proyectos en los que sea manager
          { manager: { $in: req.user.id } },
          // buscamos los proyectos en los que seas parte del equipo
          { team: { $in: req.user.id } },
        ],
      });
      res.json(projects); // enviamos los proyectos
    } catch (error) {
      console.log(error);
    }
  };
  // declaramos la funcionalidad de la ruta GET by Id
  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params; // aplicamos destructuring al id
    try {
      const project = await Project.findById(id).populate("tasks"); // buscamos el proyecto con el id indicado en la base de datos
      // si no se encuentra el proyecto devolvemos un error
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // si el que esta accediendo al proyecto no es el manager, devolvemos un error o no pertenece al equipo
      if (
        project.manager.toString() !== req.user.id.toString() &&
        !project.team.includes(req.user.id)
      ) {
        const error = new Error("Acción no valida");
        res.status(404).json({ error: error.message });
        return;
      }
      res.json(project); // enviamos el proyecto
    } catch (error) {
      console.log(error);
    }
  };
  // declaramos la funcionalidad de la ruta PUT by Id
  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName; // asignamos el nombre al proyecto
      req.project.clientName = req.body.clientName; // asignamos el nombre delcliente del proyecto
      req.project.description = req.body.description; // asignamos la descripcion al proyecto
      await req.project.save(); // guardamos el proyecto en la base de datos
      res.send("Proyecto actualizado correctamente");
    } catch (error) {
      console.log(error);
    }
  };
  // declaramos la funcionalidad de la ruta DELETE by Id
  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne(); // eliminamos el proyecto de la base de datos
      res.send("Proyecto eliminado correctamente");
    } catch (error) {
      console.log(error);
    }
  };
}

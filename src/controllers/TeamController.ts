// importamos request y response de express
import type { Request, Response } from "express";
// importamos User de nuestro modelo User
import User from "../models/User";
// importamos el modelo de proyecto
import Project from "../models/Proyect";

// TeamController es un objeto que se encargara de manejar las peticiones de nuestra API del team
export class TeamMemberController {
  // creamos una función que nos permitirá buscar un usuario por email
  static findMemberByEmail = async (req: Request, res: Response) => {
    // extraemos el email
    const { email } = req.body;

    // buscamos el usuario en la base de datos
    const user = await User.findOne({ email })
      // seleccionamos solo los datos que nos interesan
      .select("id email name");
    // si el usuario no existe, mostramos un mensaje de error
    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    // si todo salió bien, enviamos un mensaje de éxito al usuario
    res.json(user);
  };
  // creamos una función que nos permitirá ver los usuarios de un equipo
  static getProjectTeam = async (req: Request, res: Response) => {
    // extraemos el proyecto
    const project = await Project.findById(req.project.id)
      // seleccionamos que buscamos los datos del grupo team y que solo queremos los datos del select
      .populate({
        path: "team",
        select: "id email name",
      });

    res.json(project.team);
  };
  // creamos una función que nos permitirá agregar un usuario a un equipo
  static addMemberById = async (req: Request, res: Response) => {
    // extraemos el id
    const { id } = req.body;

    // buscamos el usuario en la base de datos
    const user = await User.findById(id)
      // seleccionamos solo los datos que nos interesan
      .select("id");
    // si el usuario no existe, mostramos un mensaje de error
    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }
    // revisamos que este usuario no este ya agregado
    if (
      req.project.team.some((team) => team.toString() === user.id.toString())
    ) {
      // si este usuario ya esta en el team, mostramos un mensaje de error
      const error = new Error("El usuario ya esta en el equipo");
      res.status(409).json({ error: error.message });
      return;
    }
    // accedemos a la colección de usuarios del team ya que en la url tenemos el id del proyecto
    req.project.team.push(user.id);
    // guardamos los cambios
    await req.project.save();
    // si todo salió bien, enviamos un mensaje de éxito al usuario
    res.send("Usuario agregado correctamente");
  };
  // creamos una función que nos permitirá eliminar un usuario de un equipo
  static removeMemberById = async (req: Request, res: Response) => {
    // extraemos el id
    const { userId } = req.params;

    if (!req.project.team.some((team) => team.toString() === userId)) {
      // si este usuario ya esta en el team, mostramos un mensaje de error
      const error = new Error("El usuario no esta en el equipo");
      res.status(409).json({ error: error.message });
      return;
    }

    // revisamos que este usuario este en el equipo
    req.project.team = req.project.team.filter(
      (teamMember) => teamMember.toString() !== userId
    );

    // guardamos los cambios
    await req.project.save();
    // si todo salió bien, enviamos un mensaje de éxito al usuario
    res.send("Usuario eliminado correctamente");
  };
}

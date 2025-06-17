// importamos los types de Request y Response
import type { Request, Response } from "express";
// importamos el modelo y la interfaz de Note
import Note, { INote } from "../models/Note";
// importamos los Types de mongoose
import { Types } from "mongoose";

// declaramos el type de note
type NoteParams = {
  noteId: Types.ObjectId;
};

// declaramos el controller
export class NoteController {
  // declaramos la funcionalidad de la ruta POST
  static createNote = async (
    req: Request<
      // Los types de Params
      {},
      // Los types de ResBody
      {},
      // Los types del ReqBody
      INote,
      // Los types de ReqQuery
      {}
    >,
    res: Response
  ) => {
    // guardamos el contenido de la nota
    const { content } = req.body;
    // creamos una nueva nota
    const note = new Note();
    // asignamos el contenido de la nota
    note.content = content;
    // asignamos al usuario que creo la nota
    note.createdBy = req.user.id;
    // asignamos la tarea a la que pertenece la nota
    note.task = req.task.id;
    // enviamos la nota en la tarea
    req.task.notes.push(note.id);
    try {
      // guardamos la nota en la base de datos
      await Promise.allSettled([req.task.save(), note.save()]);
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Nota creada correctamente");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al crear la nota");
    }
  };

  // declaramos la funcionalidad de la ruta get
  static getTaskNotes = async (req: Request<NoteParams>, res: Response) => {
    try {
      // buscamos las notas asociadas a la tarea
      const notes = await Note.find({ task: req.task.id })
        // decimos que nos llene el campo createdBy con su id, el nombre y el email
        .populate({
          path: "createdBy",
          select: "_id name email",
        });
      res.json(notes);
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al crear la nota");
    }
  };

  // declaramos la funcionalidad de la ruta delete
  static deleteNote = async (req: Request, res: Response) => {
    // extraemos el id de la nota
    const { noteId } = req.params;
    // buscamos la nota con el id
    const note = await Note.findById(noteId);
    // si no se encuentra la nota, devolvemos un error
    if (!note) {
      const error = new Error("Nota no encontrada");
      res.status(404).json({ error: error.message });
      return;
    }
    // comprobamos que quien elimina la nota sea quien la creo
    if (note.createdBy.toString() !== req.user.id.toString()) {
      const error = new Error("Acción no valida");
      res.status(401).json({ error: error.message });
      return;
    }

    // actualizamos las notas de la base de datos
    req.task.notes = req.task.notes.filter(
      (note) => note.toString() !== noteId.toString()
    );

    try {
      // eliminamos la nota y guardamos todos los cambios en la base de datos
      await Promise.allSettled([req.task.save(), note.deleteOne()]);
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Nota eliminada correctamente");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al crear la nota");
    }
  };
}

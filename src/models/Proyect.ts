// importamos mongoose, Schema y Document para crear modelos
import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
// importamos la interfaz de task y el modelo Task
import Task, { ITask } from "./Task";
// importamos la interfaz de user
import { IUser } from "./User";
// importamos el modelo Note
import Note from "./Note";

// declaramos IProject como un Document (typescript)
export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[]; // PopulatedDoc es un tipo de mongoose Document que se utiliza para recuperar datos de otros modelos (subdocumentos)
  // le pasamos via generics el type de task y documento para que mongoose pueda recuperar los datos de los task en la propiedad tasks
  // y acabamos con un array ya que una tarea pertenece a un project pero un project puede tener varias tareas
  manager: PopulatedDoc<IUser & Document>; // PopulatedDoc es un tipo de mongoose Document que se utiliza para recuperar datos de otros modelos (subdocumentos)
  // le pasamos via generics el type de IUser y documento para que mongoose pueda recuperar los datos de los user en la propiedad user
  // agregamos una propiedad para el equipo del proyecto
  team: PopulatedDoc<IUser & Document>[];
}

// declaramos el Schema de Project (mongoose)
const ProjectSchema: Schema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true, // quitamos espacios al principio y final
      // unique: true, // no se puede repetir el nombre del proyecto
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tasks: [
      // definimos una propiedad tasks que es un array de tareas
      {
        type: Types.ObjectId, // tipo de mongoose ObjectId
        ref: "Task", // referencia al task al que pertenece el proyecto
      },
    ],
    manager: {
      type: Types.ObjectId, // tipo de mongoose ObjectId
      ref: "User", // referencia al user al que pertenece el proyecto
    },
    team: [
      // definimos una propiedad team que es un array de usuarios
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true } // definimos que se debe guardar el timestamp en la base de datos
);

/** Middleware para eliminar tareas relacionadas con un proyecto */
ProjectSchema.pre("deleteOne", { document: true }, async function () {
  // extraemos el id del proyecto
  const projectId = this._id;
  if (!projectId) return;

  // busacmos todas las tareas relacionadas con el proyecto
  const tasks = await Task.find({ project: projectId });
  // borramos las notas de las tareas eliminadas
  for (const task of tasks) {
    await Note.deleteMany({ task: task._id });
  }
  // eliminamos las tareas relacionadas con el proyecto
  await Task.deleteMany({ project: projectId });
});

// declaramos el modelo Project (mongoose)
const Project = mongoose.model<IProject>("Project", ProjectSchema); // le asignamos al modelo Project el Schema ProjectSchema y el interface de IProject

export default Project;

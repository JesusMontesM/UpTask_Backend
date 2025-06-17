// importamos mongoose, Schema y Document para crear modelos
import mongoose, { Schema, Document, Types } from "mongoose";
// importamos el modelo de notas
import Note from "./Note";

// definimos un objeto con las posibles estados de un task
const taskStatus = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof taskStatus)[keyof typeof taskStatus]; // definimos el type de los estados de un task

// declaramos ITask como un Document (typescript)
export interface ITask extends Document {
  name: string;
  description: string;
  // referencia al proyecto al que pertenece el task con el type de mongoose ObjectId
  project: Types.ObjectId;
  // definimos el tipo de estado del task
  status: TaskStatus;
  // definimos el tipo de usuario que modifico la tarea
  completedBy: {
    user: Types.ObjectId;
    status: TaskStatus;
  }[];
  // definimos las notas asociadas a la tarea
  notes: Types.ObjectId[];
}

// declaramos el Schema de Task (mongoose)
export const TaskSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true, // es obligatorio
      trim: true, // quitamos espacios al principio y final
      // unique: true, // no se puede repetir el nombre del proyecto
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: Types.ObjectId, // tipo de mongoose ObjectId
      ref: "Project", // referencia al proyecto al que pertenece el task
    },
    status: {
      type: String,
      enum: Object.values(taskStatus), // definimos los posibles estados de un task
      default: taskStatus.PENDING, // por defecto el estado es PENDING
    },
    // agregamos un campo que nos diga quien modifico el estado de la tarea
    completedBy: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
          default: null,
        },
        status: {
          type: String,
          enum: Object.values(taskStatus),
          default: taskStatus.PENDING,
        },
      },
    ],
    // agregamos el campo de las notas asociadas a la tarea
    notes: [
      {
        type: Types.ObjectId,
        ref: "Note",
      },
    ],
  },
  { timestamps: true } // definimos que se debe guardar el timestamp en la base de datos
);

/** Middleware para eliminar notas relacionadas con una tarea */
TaskSchema.pre("deleteOne", { document: true }, async function () {
  // extraemos el id de la tarea
  const taskId = this._id;
  if (!taskId) return;
  // eliminamos las notas relacionadas con la tarea
  await Note.deleteMany({ task: taskId });
});

// declaramos el modelo Project (mongoose)
const Task = mongoose.model<ITask>("Task", TaskSchema); // le asignamos al modelo Task el Schema TaskSchema y el interface de ITask
export default Task;

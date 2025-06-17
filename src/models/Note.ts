// importamos mongoose, Schema y Document para crear modelos
import mongoose, { Schema, Document, Types } from "mongoose";

// Definimos una interfaz INote
export interface INote extends Document {
  content: string;
  createdBy: Types.ObjectId;
  task: Types.ObjectId;
}

// declaramos el Schema de Note (mongoose)
const NoteSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: Types.ObjectId,
      ref: "Task",
      required: true,
    },
  },
  { timestamps: true }
);

// declaramos el modelo Note (mongoose)
const Note = mongoose.model<INote>("Note", NoteSchema); // le asignamos al modelo Note el Schema NoteSchema y el interface de INote

export default Note;

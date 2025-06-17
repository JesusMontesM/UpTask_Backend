// importamos nodemailer para enviar emails desde nuestra aplicación
import nodemailer from "nodemailer";
// importamos dotenv para cargar variables de entorno
import dotenv from "dotenv";

// cargamos las variables de entorno
dotenv.config();

const config = () => {
  return {
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
};

// cada vez que llamemos a transporter nos enviará un email desde nuestra aplicación
export const transporter = nodemailer.createTransport(config());

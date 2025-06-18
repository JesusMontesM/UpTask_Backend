// importamos transporter de nodemailer para enviar emails
import { transporter } from "../config/nodemailer";

// Definimos una interfaz IEmail
interface IEmail {
  email: string;
  name: string;
  token: string;
}

// AuthEmail es un objeto que se encargara de manejar las peticiones de nuestra API relacionadas con los mails
export class AuthEmail {
  // creamos una función que nos permitirá enviar los mails de confirmación de cuenta
  static sendConfirmationEmail = async (user: IEmail) => {
    // usamos transporter con .sendmail para enviar un mail
    const info = await transporter.sendMail({
      // el correo que envia el mail
      from: "UpTask <eammontesjesus@gmail.com>",
      // el destinatario del mail
      to: user.email,
      // el asunto del mail
      subject: "Confirma tu cuenta en UpTask",
      // el contenido del mail
      text: "UpTask - Confirma tu cuenta",
      // el contenido del mail en formato HTML
      html: `
          <h1>Hola ${user.name}</h1>
          <p>Bienvenido a UpTask, para confirmar tu cuenta haz click en el siguiente enlace:</p>
          <p> <a href="${process.env.FRONTEND_URL}/auth/confirm-account/">Confirmar cuenta</a> </p>
          <p>E ingresa el código: <b>${user.token}</b></p>
          <p>Este código solo es válido por 10 minutos.</p>
          `,
    });
    // imprimimos el mensaje de éxito del mail enviado
    console.log("Email enviado con éxito", info.messageId);
  };

  // creamos una función que nos permitirá enviar los mails de cambiar contraseña
  static sendPasswordResetToken = async (user: IEmail) => {
    // usamos transporter con .sendmail para enviar un mail
    const info = await transporter.sendMail({
      // el correo que envia el mail
      from: "UpTask <admin@uptask.com>",
      // el destinatario del mail
      to: user.email,
      // el asunto del mail
      subject: "Reestablecer contraseña en UpTask",
      // el contenido del mail
      text: "UpTask - Reestablece tu contraseña",
      // el contenido del mail en formato HTML
      html: `
          <h1>Hola ${user.name}</h1>
          <p>Has solicitado reestablecer tu contraseña en UpTask.</p>
          <p>Para completar la solicitud, haz click en el siguiente enlace:</p>
          <p> <a href="${process.env.FRONTEND_URL}/auth/new-password/">Reestablecer contraseña</a> </p>
          <p>E ingresa el código: <b>${user.token}</b></p>
          <p>Este código solo es válido por 10 minutos.</p>
          `,
    });
    // imprimimos el mensaje de éxito del mail enviado
    console.log("Email enviado con éxito", info.messageId);
  };
}

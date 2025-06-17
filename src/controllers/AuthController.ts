// importamos request y response de express
import type { Request, Response } from "express";
// importamos User de nuestro modelo User
import User from "../models/User";
// importamos la funcion para cifrar contraseñas y verificar contraseñas
import { checkPassword, hashPassword } from "../utils/auth";
// importamos Token de nuestro modelo Token
import Token from "../models/Token";
// importamos nuetsra funcion de genrar token
import { generateToken } from "../utils/token";
// importamos la clase AuthEmail para enviar mails
import { AuthEmail } from "../emails/AuthEmail";
// importamos la funcion para generar el tokenJWT
import { generateJWT } from "../utils/jwt";

// AuthController es un objeto que se encargara de manejar las peticiones de nuestra API relacionadas con la autentificación
export class AuthController {
  // creamos una función que nos permitirá crear una cuenta
  static createAccount = async (req: Request, res: Response) => {
    try {
      // recogemos la contraseña y el email enviados en la petición
      const { password, email } = req.body;

      /** Prevenir usuarios duplicados */

      // creamos una consulta para buscar si el usuario ya existe en la base de datos con findOne que va a buscar por el email enviado
      const userExists = await User.findOne({ email });
      // si el usuario existe, mostramos un mensaje de error
      if (userExists) {
        const error = new Error("El usuario ya existe");
        res.status(409).json({ error: error.message });
        return;
      }
      // creamos un nuevo objeto User con los datos enviados en la petición
      const user = new User(req.body);

      /** hash password */

      user.password = await hashPassword(password);

      /** Generar token */

      // creamos una nueva instancia de Token
      const token = new Token();
      // generamos un token aleatorio
      token.token = generateToken();
      // establecemos el usuario del token
      token.user = user.id;

      /** Enviar email de confirmacion de cuenta*/
      AuthEmail.sendConfirmationEmail({
        // enviamos el email, el nombre del usuario y el token a la función sendConfirmationEmail
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // guardamos el usuario y el token en la base de datos
      await Promise.allSettled([user.save(), token.save()]);
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Cuenta creada con exito, revisa tu email para confirmarla");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al crear la cuenta");
    }
  };
  // creamos una función que nos permitirá confirmar las cuentas
  static confirmAccount = async (req: Request, res: Response) => {
    try {
      // extraemos el token
      const { token } = req.body;
      // buscamos el token en la base de datos
      const tokenExists = await Token.findOne({ token });
      // si el token no existe, mostramos un mensaje de error
      if (!tokenExists) {
        const error = new Error("El token no es válido");
        res.status(404).json({ error: error.message });
        return;
      }
      // si el token existe, extraemos el usuario
      const user = await User.findById(tokenExists.user);
      // confirmamos el usuario en la base de datos
      user.confirmed = true;
      // guardamos el usuario en la base de datos y eliminamos el token
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Cuenta confirmada con exito");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al confirmar la cuenta");
    }
  };
  // creamos una función que nos permitirá confirmar las cuentas
  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      // buscamos el usuario en la base de datos
      const user = await User.findOne({ email });
      // si el usuario no existe, mostramos un mensaje de error
      if (!user) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      // comprobamos que el usuario este autentificado
      if (!user.confirmed) {
        // al no estar confirmado le generamos otro token al usuario
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();
        // guardamos el token en la base de datos
        await token.save();
        /** Enviar email con el nuevo token */
        AuthEmail.sendConfirmationEmail({
          // enviamos el email, el nombre del usuario y el token a la función sendConfirmationEmail
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "El usuario no ha sido autentificado, hemos enviado un email de confirmacion"
        );
        res.status(401).json({ error: error.message });
        return;
      }
      /** revisamos la contraseña */
      const isPasswordCorrect = await checkPassword(password, user.password);
      // si la contraseña es incorrecta, mostramos un mensaje de error
      if (!isPasswordCorrect) {
        const error = new Error("La contraseña no es correcta");
        res.status(401).json({ error: error.message });
        return;
      }

      /** Generar JWT */

      // creamos un token de sesión
      const token = generateJWT({ id: user.id });

      res.send(token);
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al iniciar sesión");
    }
  };
  // creamos una función para solicitar un nuevo token
  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      // recogemos el email enviado en la petición
      const { email } = req.body;

      /** buscar que el usuaio exista */

      // creamos una consulta para buscar si el usuario ya existe en la base de datos con findOne que va a buscar por el email enviado
      const user = await User.findOne({ email });
      // si el usuario existe, mostramos un mensaje de error
      if (!user) {
        const error = new Error("El usuario no esta registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      /** Revisar que el usuario no este confirmado */
      if (user.confirmed) {
        const error = new Error("El usuario ya esta confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      /** Generar token */

      // creamos una nueva instancia de Token
      const token = new Token();
      // generamos un token aleatorio
      token.token = generateToken();
      // establecemos el usuario del token
      token.user = user.id;

      /** Enviar email de confirmacion de cuenta*/
      AuthEmail.sendConfirmationEmail({
        // enviamos el email, el nombre del usuario y el token a la función sendConfirmationEmail
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // guardamos el usuario y el token en la base de datos
      await Promise.allSettled([user.save(), token.save()]);
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Se envio un nuevo código a tu email");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al crear la cuenta");
    }
  };
  // creamos una función para restablecer la contraseña
  static forgotPassword = async (req: Request, res: Response) => {
    try {
      // recogemos el email enviado en la petición
      const { email } = req.body;

      /** buscar que el usuaio exista */

      // creamos una consulta para buscar si el usuario ya existe en la base de datos con findOne que va a buscar por el email enviado
      const user = await User.findOne({ email });
      // si el usuario existe, mostramos un mensaje de error
      if (!user) {
        const error = new Error("El usuario no esta registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      /** Generar token */

      // creamos una nueva instancia de Token
      const token = new Token();
      // generamos un token aleatorio
      token.token = generateToken();
      // establecemos el usuario del token
      token.user = user.id;
      // guardamos el token en la base de datos
      await token.save();

      /** Enviar email de cambiar contraseña */
      AuthEmail.sendPasswordResetToken({
        // enviamos el email, el nombre del usuario y el token a la función sendConfirmationEmail
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("revisa tu email para cambiar la contraseña");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Hubo un error al enviar el email");
    }
  };
  // creamos una función que nos permitirá confirmar el token
  static validateToken = async (req: Request, res: Response) => {
    try {
      // extraemos el token
      const { token } = req.body;
      // buscamos el token en la base de datos
      const tokenExists = await Token.findOne({ token });
      // si el token no existe, mostramos un mensaje de error
      if (!tokenExists) {
        const error = new Error("El token no es válido");
        res.status(404).json({ error: error.message });
        return;
      }
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Codigo validado, Define tu nueva contraseña");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al confirmar la cuenta");
    }
  };
  // creamos una función que nos permitirá confirmar el token
  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      // extraemos el token
      const { token } = req.params;
      // extraemos la contraseña
      const { password } = req.body;
      // buscamos el token en la base de datos
      const tokenExists = await Token.findOne({ token });
      // si el token no existe, mostramos un mensaje de error
      if (!tokenExists) {
        const error = new Error("El token no es válido");
        res.status(404).json({ error: error.message });
        return;
      }
      // buscamos al usuario con el token
      const user = await User.findById(tokenExists.user);
      // actualizamos la contraseña y la hasheamos
      user.password = await hashPassword(password);

      // guardamos el usuario en la base de datos y eliminamos el token
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("La contraseña se ha actualizado correctamente");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al confirmar la cuenta");
    }
  };
  // creamos una función que nos permitirá confirmar el token
  static user = async (req: Request, res: Response) => {
    // retornamos el usuario actual, que esta guardado en el request
    res.send(req.user);
    return;
  };

  /** Profile */

  // creamos una función que nos permitirá actualizar nuestro perfil
  static updateProfile = async (req: Request, res: Response) => {
    // extraemos nombre y email
    const { name, email } = req.body;
    // comprobamos que el correo no exista en la base de datos
    const userExists = await User.findOne({ email });
    if (
      userExists &&
      // la segunda comprobacion es que el usuario que intenta usar ese correo no es el usuario al que le pertenece se correo, es decir, el usuario actual
      userExists.id.toString() !== req.user.id.toString()
    ) {
      const error = new Error("Ese correo ya esta registrado");
      res.status(409).json({ error: error.message });
      return;
    }
    req.user.name = name;
    req.user.email = email;
    try {
      // guardamos el usuario en la base de datos
      await req.user.save();
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Perfil actualizado con exito");
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al editar el perfil");
    }
    return;
  };

  // creamos una función que nos permitirá cambiar la contraseña
  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    // extraemos la contraseña que ingresa el usuario
    const { current_password, password } = req.body;
    // extraemos el usuario
    const user = await User.findById(req.user.id);
    //comprobamos las contraseñas si coinciden
    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );
    // si la contraseña no es correcta, mostramos un mensaje de error
    if (!isPasswordCorrect) {
      const error = new Error("La contraseña actual no es correcta");
      res.status(401).json({ error: error.message });
      return;
    }
    try {
      // si las contraseñas coinciden, actualizamos la contraseña y la hasheamos
      user.password = await hashPassword(password);
      // guardamos el usuario en la base de datos
      await user.save();
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Contraseña actualizada con exito");
      return;
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al editar el perfil");
    }
    return;
  };

  // creamos una función para revisar la contraseña
  static checkPassword = async (req: Request, res: Response) => {
    // extraemos la contraseña que ingresa el usuario
    const { password } = req.body;
    // extraemos el usuario
    const user = await User.findById(req.user.id);
    //comprobamos las contraseñas si coinciden
    const isPasswordCorrect = await checkPassword(password, user.password);
    // si la contraseña no es correcta, mostramos un mensaje de error
    if (!isPasswordCorrect) {
      const error = new Error("La contraseña no es correcta");
      res.status(401).json({ error: error.message });
      return;
    }
    res.send("Contraseña correcta");
    return;
  };
  /** 
    try {
      // si las contraseñas coinciden, actualizamos la contraseña y la hasheamos
      user.password = await hashPassword(password);
      // guardamos el usuario en la base de datos
      await user.save();
      // si todo salió bien, enviamos un mensaje de éxito al usuario
      res.send("Contraseña actualizada con exito");
      return;
    } catch (error) {
      // si ocurre algún error, enviamos un mensaje de error al usuario
      res.status(500).send("Error al editar el perfil");
    }
    return;
  };
  */
}

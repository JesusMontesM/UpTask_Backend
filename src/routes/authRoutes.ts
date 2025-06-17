// Router nos permite crear rutas modulares
import { Router } from "express";
// importamos nuestra clase AuthController para poder usar sus funciones en nuestras rutas
import { AuthController } from "../controllers/AuthController";
// importamos body de express-validator para validar los datos enviados en las peticiones y param para validar los parámetros de las peticiones
import { body, param } from "express-validator";
// importamos handleInputErrors de nuestro middleware para manejar los errores de validación
import { handleInputErrors } from "../middleware/validation";
// importamos el middleware para autentificación del token de sesion
import { authenticate } from "../middleware/auth";

// Creamos una nueva instancia de Router
// Esta instancia nos servirá para definir rutas específicas que luego podremos usar en nuestra aplicación principal
const router = Router();

// Creamos una ruta POST que se encargará de crear una cuenta
router.post(
  "/create-account",
  // validamos que el nombre, contraseña y email sean obligatorios
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Contraseña demasiado corta"),
  // validacion de contraseñas iguales
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),
  body("email").isEmail().withMessage("El email no es válido"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  // llamamos a la función createAccount de nuestra clase AuthController
  AuthController.createAccount
);

// Creamos una ruta POST que se encargará de confirmar las cuentas
router.post(
  "/confirm-account",
  // validamos que el token sea obligatorio
  body("token").notEmpty().withMessage("El token es obligatorio"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  // llamamos a la función confirmAccount de nuestra clase AuthController
  AuthController.confirmAccount
);

// Creamos una ruta POST que se encargará del flujo del login
router.post(
  "/login",
  // validamos contraseña y email
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  // llamamos a la función login de nuestra clase AuthController
  AuthController.login
);

// Creamos una ruta POST que se encargará de enviar el código de confirmación
router.post(
  "/request-code",
  // validamos email
  body("email").isEmail().withMessage("El email no es válido"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  // llamamos a la función requestConfirmationCode de nuestra clase AuthController
  AuthController.requestConfirmationCode
);

// Creamos una ruta POST que se encargará de enviar el email para restablecer la contraseña
router.post(
  "/forgot-password",
  // validamos email
  body("email").isEmail().withMessage("El email no es válido"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  // llamamos a la función forgotPassword de nuestra clase AuthController
  AuthController.forgotPassword
);

// Creamos una ruta POST que se encargará de validar el token para restablecer la contraseña
router.post(
  "/validate-token",
  // validamos el token
  body("token").notEmpty().withMessage("El token es obligatorio"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  // llamamos a la función validateToken de nuestra clase AuthController
  AuthController.validateToken
);

// Creamos una ruta POST que se encargará de validar el formulario de reestablecimiento de contraseña
router.post(
  "/update-password/:token",
  // validamos el token
  param("token").notEmpty().withMessage("El token no es válido"),
  // validamos la contraseña
  body("password")
    .isLength({ min: 8 })
    .withMessage("Contraseña demasiado corta"),
  // validacion de contraseñas iguales
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  // llamamos a la función updatePasswordWithToken de nuestra clase AuthController
  AuthController.updatePasswordWithToken
);

// creamos una ruta para obtener el usuario actual
router.get(
  "/user",
  // validamos que el token sea válido
  authenticate,
  AuthController.user
);

/** Profile */

// creamos una ruta para actualizar nuestro perfil
router.put(
  "/profile",
  // validamos que el token sea válido
  authenticate,
  // validamos que el nombre y email sean obligatorios
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("El email no es válido"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  AuthController.updateProfile
);

// creamos una ruta para cambiar la contraseña
router.post(
  "/update-password",
  // validamos que el token sea válido
  authenticate,
  // validamos que la contraseña actual sea obligatoria
  body("current_password")
    .notEmpty()
    .withMessage("La contraseña actual es obligatoria"),
  // validamos que la contraseña y la confirmacion sean obligatorios
  body("password")
    .isLength({ min: 8 })
    .withMessage("Contraseña demasiado corta"),
  // validacion de contraseñas iguales
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

// creamos una ruta para revisar la contraseña
router.post(
  "/check-password",
  // validamos que el token sea válido
  authenticate,
  // validamos que la contraseña
  body("password").notEmpty().withMessage("La contraseña no puede estar vacía"),
  // llamamos a la función handleInputErrors para manejar los errores de validación
  handleInputErrors,
  AuthController.checkPassword
);

export default router;

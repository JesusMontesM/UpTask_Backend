// importamos bcrypt de node.js para cifrar contraseñas
import bcrypt from "bcrypt";

/** hash password */
export const hashPassword = async (password: string) => {
  // generamos un salt aleatorio que nos servira para hashear cada contraeña de manera unica
  // a mas alto el numero mas aleatorio es y más seguro, pero mas lento y consume mas recursos
  const salt = await bcrypt.genSalt(10);
  // ciframos la contraseña con el salt generado
  return await bcrypt.hash(password, salt);
};
/** verifica si la contraseña es correcta */
export const checkPassword = async (
  enteredPassword: string,
  storedHash: string
) => {
  // verificamos si la contraseña es correcta usando la funcion compare de bcrypt que nos devuelve true o false
  return await bcrypt.compare(enteredPassword, storedHash);
};

// creamos la funcion que nos genere los tokende 6 digitos
export const generateToken = () =>
  Math.floor(Math.random() * 999999).toString();

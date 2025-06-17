
// importamor colors para colorear la salida
import colors from "colors";
// importamos el servidor
import server from "./server";

// declaramos el puerto
const port = process.env.PORT || 4000; // si no esta disponible, usamos el puerto 4000

// iniciamos el servidor
server.listen(port, () => {
  console.log(colors.cyan.bold(`REST API funcionando en el puerto ${port}`));
});


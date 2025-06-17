// importamos cors
import { CorsOptions } from "cors";

// exportamos la configuración de cors
export const corsConfig: CorsOptions = {
  // definimos el origen que queremos darle acceso
  // y callback va a ser llamado cuando el origen es valido
  origin: function (origin, callback) {
    const whitelist = [process.env.FRONTEND_URL]; // url de nuestro frontend

    // si estamos en modo api y el origen es undefined, entonces le damos acceso a undefined
    if (process.argv[2] === "--api") {
      whitelist.push(undefined);
    }
    // si el origen es valido vamos a darle acceso
    if (whitelist.includes(origin)) {
      // el primer parametro de callback es el error por lo que le pasamos null y el segudo es el acceso, por eso le pasamos true
      callback(null, true);
    } else {
      // aqui le pasamos el error por lo que directamente se niega el acceso
      callback(new Error("Not allowed by CORS"));
    }
  },
};

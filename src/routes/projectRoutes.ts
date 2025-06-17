// importamos el router
import { Router } from "express";
// importamos la libreria para añadir validaciones
import { body, param } from "express-validator";
// importamos el controller
import { ProjectController } from "../controllers/ProjectController";
// importamos los middleware para los errores
import { handleInputErrors } from "../middleware/validation";
// middleware par saber si el proyecto existe
import { projectExists } from "../middleware/project";
// middleware de tareas
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExists,
} from "../middleware/task";

// importamos el controller para las tareas
import { TaskController } from "../controllers/TaskController";
// importamos el middleware para la autentificación
import { authenticate } from "../middleware/auth";
// importamos el controller para el team
import { TeamMemberController } from "../controllers/TeamController";
// importamos el controller para las notas
import { NoteController } from "../controllers/NoteController";

// declaramos el router
const router = Router();

// validamos que el token de sesión sea válido en todos los endpoints
router.use(authenticate);

/**ROUTES FOR PROJECTS**/

// declaramos la ruta POST
router.post(
  "/",
  // validamos el body
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  handleInputErrors,
  ProjectController.createProject
);
// declaramos la ruta GET
router.get("/", ProjectController.getAllProjects);

// declaramos la ruta GET by Id
router.get(
  "/:id",
  // validamos que el id sea un id valido
  param("id").isMongoId().withMessage("ID no valido"),
  projectExists, // validamos que el proyecto exista
  handleInputErrors,
  ProjectController.getProjectById
);

// validamos que el proyecto exista
router.param("projectId", projectExists);

// declaramos la ruta PUT by Id
router.put(
  "/:projectId",
  // validamos que el id sea un id valido
  param("projectId").isMongoId().withMessage("ID no valido"),
  projectExists, // validamos que el proyecto exista
  // validamos el body
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  // middleware de autorizacion
  hasAuthorization,
  // middleware para errores
  handleInputErrors,
  ProjectController.updateProject
);
// declaramos la ruta DELETE by Id
router.delete(
  "/:projectId",
  // validamos que el id sea un id valido
  param("projectId").isMongoId().withMessage("ID no valido"),
  projectExists, // validamos que el proyecto exista
  // middleware de autorizacion
  hasAuthorization,
  // middleware para errores
  handleInputErrors,
  ProjectController.deleteProject
);

/**ROUTES FOR TASKS**/

// declaramos la ruta POST
router.post(
  "/:projectId/tasks",
  // middleware para validar que el usuario actual sea el manager del proyecto
  hasAuthorization,
  // validamos el body
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.createTask
);

// declaramos la ruta GET
router.get("/:projectId/tasks", TaskController.getProjectTasks);

// validamos que la tarea exista
router.param("TaskId", taskExists);

// validamos que la tarea pertenezca a un proyecto
router.param("TaskId", taskBelongsToProject);

// declaramos la ruta GET by Id
router.get(
  "/:projectId/tasks/:TaskId",
  // validamos que el id sea un id valido
  param("TaskId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TaskController.getTaskById
);

// declaramos la ruta PUT by Id
router.put(
  "/:projectId/tasks/:TaskId",
  // middleware para validar que el usuario actual sea el manager del proyecto
  hasAuthorization,
  // validamos que el id sea un id valido
  param("TaskId").isMongoId().withMessage("ID no valido"),
  // validamos el body
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.updateTask
);

// declaramos la ruta DELETE by Id
router.delete(
  "/:projectId/tasks/:TaskId",
  // middleware para validar que el usuario actual sea el manager del proyecto
  hasAuthorization,
  // validamos que el id sea un id valido
  param("TaskId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TaskController.deleteTask
);

// declaramos la ruta para actualizar los estados de las tareas
router.post(
  "/:projectId/tasks/:TaskId/status",
  // validamos que el id sea un id valido
  param("TaskId").isMongoId().withMessage("ID no valido"),
  body("status").notEmpty().withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
);

/** ROUTES FOR TEAMS **/

// declaramos la ruta para buscar usuarios
router.post(
  "/:projectId/team/find",
  // middleware para validar que el usuario actual sea el manager del proyecto
  hasAuthorization,
  // validamos el email
  body("email").isEmail().toLowerCase().withMessage("Email no valido"),
  // middleware para manejo de errores
  handleInputErrors,
  TeamMemberController.findMemberByEmail
);

// declaramos la ruta para ver los usuarios de un equipo
router.get(
  "/:projectId/team",
  // middleware para validar que el usuario actual sea el manager del proyecto
  hasAuthorization,
  TeamMemberController.getProjectTeam
);

// declaramos la ruta para agregar usuarios a un equipo
router.post(
  "/:projectId/team",
  // middleware para validar que el usuario actual sea el manager del proyecto
  hasAuthorization,
  // validamos el id
  body("id").isMongoId().withMessage("ID no valido"),
  // middleware para manejo de errores
  handleInputErrors,
  TeamMemberController.addMemberById
);

// declaramos la ruta para eliminar usuarios de un equipo
router.delete(
  "/:projectId/team/:userId",
  // middleware para validar que el usuario actual sea el manager del proyecto
  hasAuthorization,
  // validamos el id
  param("userId").isMongoId().withMessage("ID no valido"),
  // middleware para manejo de errores
  handleInputErrors,
  TeamMemberController.removeMemberById
);

/** Routes for Notes */

// declaramos la ruta para crear notas
router.post(
  "/:projectId/tasks/:TaskId/notes",
  // Validamos que el mensaje no este vacio
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota no puede estar vacio"),
  // nuestro middleware de errores
  handleInputErrors,
  NoteController.createNote
);

// declaramos la ruta para ver las notas
router.get("/:projectId/tasks/:TaskId/notes", NoteController.getTaskNotes);

// declaramos la ruta para eliminar notas
router.delete(
  "/:projectId/tasks/:TaskId/notes/:noteId",
  // Validamos que el id sea un id valido
  param("noteId").isMongoId().withMessage("ID no valido"),
  // nuestro middleware de errores
  handleInputErrors,
  NoteController.deleteNote
);

// exportamos el router
export default router;

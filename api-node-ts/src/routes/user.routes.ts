// Importation du module Router d'Express pour gérer les routes
import { Router } from "express";

// Importation des contrôleurs qui gèrent la logique métier pour les utilisateurs
import {
  addUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/user.controller";

// Création d'un routeur Express
const router = Router();

// Route POST /users
router.post("/", addUser);

// Route GET /users
router.get("/", getUsers);

// Route GET /users/:id
router.get("/:id", getUserById);

// Route PUT /users/:id
router.put("/:id", updateUser);

// Route DELETE /users/:id
router.delete("/:id", deleteUser);

// Exportation du routeur pour l'utiliser dans index.ts
export default router;

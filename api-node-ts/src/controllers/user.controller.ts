import { Request, Response } from 'express';
import db from '../db';

//  On supprime le tableau en mémoire, car maintenant on utilise SQLite
// const users: { name: string; email: string }[] = [];

//  Les fonctions helpers SQLite permettent d'utiliser async/await
const run = (sql: string, params: any[] = []) =>
  new Promise<{ id?: number; changes?: number }>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const all = (sql: string, params: any[] = []) =>
  new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const get = (sql: string, params: any[] = []) =>
  new Promise<any>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });


// On utilisera GET /userspour lire tous les utilisateurs dans la BD
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await all("SELECT * FROM users");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Une erreur a eue lieue lors de la récupération." });
  }
};

// On fera GET /users/:id pour récupérer un utilisateur spécifique
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
  }
};

// On fera POST /users pour un ajout en base au lieu de push()
export const addUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Le nom et l'email sont requis." });
  }

  try {
    const result = await run(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    console.log("Ajout d'un utilisateur en base :", { id: result.id, name, email });

    res.status(201).json({
      message: `L'utilisateur ${name} a été ajouté avec succès !`,
      id: result.id,
      name,
      email
    });
  } catch (err: any) {
    if (err?.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({ message: "Cet email est déjà utilisé !" });
    } else {
      res.status(500).json({ message: "Une erreur serveur a eue lieue." });
    }
  }
};

// On utilisera PUT /users/:id afin de mettre à jour un utilisateur
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ message: "Veuillez fournir un nom ou un email à mettre à jour." });
  }

  try {
    const user = await get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const newName = name || user.name;
    const newEmail = email || user.email;

    const result = await run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [newName, newEmail, id]
    );

    if (result.changes === 0) {
      return res.status(400).json({ message: "Aucune mise à jour effectuée." });
    }

    res.json({ message: "Utilisateur mis à jour avec succès.", id, name: newName, email: newEmail });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
  }
};

// On mettra DELETE /users/:id pour supprimer un utilisateur
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await run("DELETE FROM users WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
  }
};

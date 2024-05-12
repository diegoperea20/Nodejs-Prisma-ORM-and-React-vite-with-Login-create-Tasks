import { Router } from "express";
import { prisma } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// Registrar un nuevo usuario
router.post("/loginup", async (req, res) => {
  const { email, user, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { user } });
    if (existingUser) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        user,
        password: hashedPassword,
      },
    });

    return res.json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear el usuario" });
  }
});

// Obtener todos los usuarios
router.get("/loginup", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener los usuarios" });
  }
});

// Obtener un usuario por ID
router.get("/loginup/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

// Actualizar un usuario
router.put("/loginup/:id", async (req, res) => {
  const { id } = req.params;
  const { email, user, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        user,
        password: hashedPassword,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

// Eliminar un usuario
router.delete("/loginup/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await prisma.user.delete({ where: { id: parseInt(id) } });
    return res.json(deletedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

// Iniciar sesión
router.post("/", async (req, res) => {
  const { user, password } = req.body;

  try {
    const userData = await prisma.user.findUnique({ where: { user } });
    if (!userData) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ user_id: userData.id }, "tuclavesecretadeltoken", { expiresIn: "1h" });
    return res.json({ token, user_id: userData.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

export default router;
import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// Crear una nueva tarea
router.post("/tasks", async (req, res) => {
  const { user, title, description } = req.body;

  try {
    const newTask = await prisma.task.create({
      data: {
        user,
        title,
        description,
      },
    });

    return res.json(newTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear la tarea" });
  }
});

// Obtener todas las tareas
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener las tareas" });
  }
});

// Obtener tareas por usuario
router.get("/tasks/:user", async (req, res) => {
  const { user } = req.params;

  try {
    const tasks = await prisma.task.findMany({ where: { user } });
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener las tareas" });
  }
});

// Actualizar una tarea
router.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { user, title, description } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        user,
        title,
        description,
      },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar la tarea" });
  }
});

// Eliminar una tarea
router.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await prisma.task.delete({ where: { id: parseInt(id) } });
    return res.json(deletedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar la tarea" });
  }
});

// Eliminar todas las tareas de un usuario
router.delete("/tasks/deleteall/:user", async (req, res) => {
  const { user } = req.params;

  try {
    const deletedTasks = await prisma.task.deleteMany({ where: { user } });
    return res.json(deletedTasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar las tareas" });
  }
});

// Obtener una tarea por ID y usuario
router.get("/tasks/:id/:user", async (req, res) => {
  const { id, user } = req.params;

  try {
    const task = await prisma.task.findMany({
      where: { id: parseInt(id), user },
    });
    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener la tarea" });
  }
});

//------------------------------------------
//  Filters
//------------------------------------------
/* --get contar 
---SELECT COUNT(title) AS numero, title
--FROM Task
--GROUP BY title
--HAVING user = 'haweon';  */

// Contar los títulos repetidos
router.get('/tasksi/countsames/:user', async (req, res) => {

   const user = req.params.user;

  try {
    const query = await prisma.$queryRaw`
    SELECT COUNT(*) as "Number of titles", title
    FROM Task AS t1
    WHERE (SELECT COUNT(*) FROM Task AS t2 WHERE t2.title = t1.title AND t2.user != t1.user) > 0
    AND t1.user = ${user}
    GROUP BY t1.title;
  `;


    if (query.length === 0) {
      return res.json({ message: "Ningún título coincide con otros usuarios." });
    }

    const result = await Promise.all(
      query.map(async ({ title }) => {
        const userCount = await prisma.task.count({
          where: {
            title,
            user
          }
        });

        const otherCount = await prisma.task.count({
          where: {
            title,
            user: {
              not: user
            }
          }
        });

        return {
          "Number of titles": userCount + otherCount,
          "title": title
        };
      })
    );

    return res.json(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Hubo un error al procesar la solicitud." });
  }
}); 
  


  //email igual al titulo

/* SELECT t.title, c.email
FROM Task t
JOIN Cosa c ON t.user = c.user
WHERE t.user = 'haweon'
AND t.title IN (
    SELECT title
    FROM Task
    WHERE user <> 'haweon'
)
GROUP BY t.title, c.email; */

router.get("/taskse/countsame/:user", async (req, res) => {const { user } = req.params;

try {
  const query = await prisma.$queryRaw`
    SELECT title, GROUP_CONCAT(email) AS emails
    FROM Task
    JOIN User ON Task.user = User.user
    WHERE Task.user != ${user}
    AND Task.title IN (
      SELECT title
      FROM Task
      WHERE user = ${user}
    )
    GROUP BY title;
  `;

  // Si no hay coincidencias, retornar un mensaje
  if (query.length === 0) {
    return res.json({ message: "Ningún título coincide con otros usuarios." });
  }

  // Formatear los resultados
  const results = query.map(row => ({
    title: row.title,
    emails: row.emails.split(',') // Dividir la cadena de correos electrónicos en un arreglo
  }));

  res.json(results);
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Ocurrió un error al procesar la solicitud." });
}
});

export default router;
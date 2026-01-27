import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ===================== GET TASKS BY PROJECT ===================== */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = Number(req.query.projectId);

    if (!projectId || isNaN(projectId)) {
      res.status(400).json({
        message: "Valid projectId query parameter is required",
      });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error("getTasks error:", error);
    res.status(500).json({ message: "Failed to retrieve tasks" });
  }
};

/* ===================== CREATE TASK ===================== */
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      points,
      projectId,
      authorUserId,
      assignedUserId,
    } = req.body;

    if (!title || !projectId || !authorUserId) {
      res.status(400).json({
        message: "title, projectId, and authorUserId are required",
      });
      return;
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        dueDate,
        points,
        projectId: Number(projectId),
        authorUserId: Number(authorUserId),
        assignedUserId: assignedUserId
          ? Number(assignedUserId)
          : null,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

/* ===================== UPDATE TASK STATUS ===================== */
export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const taskId = Number(req.params.taskId);
    const { status } = req.body;

    if (!taskId || isNaN(taskId) || !status) {
      res.status(400).json({
        message: "Valid taskId and status are required",
      });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("updateTaskStatus error:", error);
    res.status(500).json({ message: "Failed to update task status" });
  }
};

/* ===================== GET TASKS BY USER ===================== */
export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    if (!userId || isNaN(userId)) {
      res.status(400).json({
        message: "Valid userId is required",
      });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: userId },
          { assignedUserId: userId },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error("getUserTasks error:", error);
    res.status(500).json({ message: "Failed to retrieve user tasks" });
  }
};

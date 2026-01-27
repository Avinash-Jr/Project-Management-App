"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTasks = exports.updateTaskStatus = exports.createTask = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/* ===================== GET TASKS BY PROJECT ===================== */
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = Number(req.query.projectId);
        if (!projectId || isNaN(projectId)) {
            res.status(400).json({
                message: "Valid projectId query parameter is required",
            });
            return;
        }
        const tasks = yield prisma.task.findMany({
            where: { projectId },
            include: {
                author: true,
                assignee: true,
                comments: true,
                attachments: true,
            },
        });
        res.json(tasks);
    }
    catch (error) {
        console.error("getTasks error:", error);
        res.status(500).json({ message: "Failed to retrieve tasks" });
    }
});
exports.getTasks = getTasks;
/* ===================== CREATE TASK ===================== */
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, status, priority, tags, startDate, dueDate, points, projectId, authorUserId, assignedUserId, } = req.body;
        if (!title || !projectId || !authorUserId) {
            res.status(400).json({
                message: "title, projectId, and authorUserId are required",
            });
            return;
        }
        const newTask = yield prisma.task.create({
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
    }
    catch (error) {
        console.error("createTask error:", error);
        res.status(500).json({ message: "Failed to create task" });
    }
});
exports.createTask = createTask;
/* ===================== UPDATE TASK STATUS ===================== */
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = Number(req.params.taskId);
        const { status } = req.body;
        if (!taskId || isNaN(taskId) || !status) {
            res.status(400).json({
                message: "Valid taskId and status are required",
            });
            return;
        }
        const updatedTask = yield prisma.task.update({
            where: { id: taskId },
            data: { status },
        });
        res.json(updatedTask);
    }
    catch (error) {
        console.error("updateTaskStatus error:", error);
        res.status(500).json({ message: "Failed to update task status" });
    }
});
exports.updateTaskStatus = updateTaskStatus;
/* ===================== GET TASKS BY USER ===================== */
const getUserTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.params.userId);
        if (!userId || isNaN(userId)) {
            res.status(400).json({
                message: "Valid userId is required",
            });
            return;
        }
        const tasks = yield prisma.task.findMany({
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
    }
    catch (error) {
        console.error("getUserTasks error:", error);
        res.status(500).json({ message: "Failed to retrieve user tasks" });
    }
});
exports.getUserTasks = getUserTasks;

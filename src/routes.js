import { randomUUID } from "node:crypto"
import { z } from "zod"

import { buildRoutePath } from './utils/build-route-path.js'
import { Database } from "./database.js"

const database = new Database()

const taskBodySchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
})

export const routes = [
    {
        method: "GET",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select("tasks", search ? {
                title: search,
                description: search
            } : null)
            
            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: "POST",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { success, data: body } = taskBodySchema.safeParse(req.body)

            if (!success) {
                return res.writeHead(400).end(JSON.stringify({
                    error: "Invalid request body"
                }))
            }

            const { title, description } = body
            
            const currentDate = new Date()

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: currentDate,
                updated_at: currentDate,
            }

            database.insert("tasks", task)
            
            return res.writeHead(201).end()
        }
    },
    {
        method: "PUT",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params

            const task = database.findById("tasks", id)

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({
                    error: "Not found",
                    message: `Could not find task with id ${id}`
                }))
            }

            const { success, data: body } = taskBodySchema.safeParse(req.body)

            if (!success) {
                return res.writeHead(400).end(JSON.stringify({
                    error: "Invalid request body"
                }))
            }

            const { title, description } = body

            database.update("tasks", id, {
                title,
                description,
                updated_at: new Date()
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: "DELETE",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params

            const task = database.findById("tasks", id)

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({
                    error: "Not found",
                    message: `Could not find task with id ${id}`
                }))
            }
            
            database.delete("tasks", id)
            return res.writeHead(204).end()
        }
    },
    {
        method: "PATCH",
        path: buildRoutePath("/tasks/:id/complete"),
        handler: (req, res) => {
            const { id } = req.params

            const task = database.findById("tasks", id)

            if (!task) {
                return res.writeHead(404).end(JSON.stringify({
                    error: "Not found",
                    message: `Could not find task with id ${id}`
                }))
            }

            const isCompletingTask = !task.completed_at

            const currentDate = new Date()

            database.update("tasks", id, {
                completed_at: isCompletingTask ? currentDate : null,
                updated_at: currentDate
            })

            return res.writeHead(204).end()
        }
    },
]
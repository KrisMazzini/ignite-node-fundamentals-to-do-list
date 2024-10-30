import fs from "node:fs"
import { parse } from "csv"

const csvPath = new URL("./tasks.csv", import.meta.url)

const importTasks = async () => {
    const parser = fs
        .createReadStream(csvPath)
        .pipe(parse({
            fromLine: 2
        }));

    for await (const record of parser) {
        const [title, description] = record
        
        const body = {
            title,
            description
        }

        fetch("http://localhost:3333/tasks", {
            method: "POST",
            body: JSON.stringify(body),
        })
    }
}

importTasks()
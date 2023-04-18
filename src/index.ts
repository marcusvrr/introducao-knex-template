import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/bands", async (req: Request, res: Response) => {
    try {
        const result = await db.raw('SELECT*FROM bands;')
        res.status(200).send(result)
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

app.post("/bands", async (req: Request, res: Response) => {
    try {
        const id: string = Math.floor(Date.now() * Math.random()).toString(36)
        const name: string = req.body.name
        if (!name || typeof name !== "string") {
            res.status(200)
            throw new Error("é necessario enviar um 'name' do tipo 'string'")
        }
        const [nameExists]: {}[] = await db.raw(`SELECT * FROM bands WHERE name = "${name}";`)
        if (nameExists) {
            throw new Error("banda já existe no banco de dados")
        }
        const newEntry = await db.raw(`INSERT INTO bands (id, name) VALUES ("${id}", "${name}") `)
        res.send("banda criada com sucesso")
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

app.put("/bands/:id", async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id
        const name: string = req.body.name
        if (!id || !name || typeof name !== "string") {
            throw new Error("é necessario passar um 'id' e um 'name' precisam ser 'strings'")
        }
        const bandExists: {}[] = await db.raw(`SELECT * FROM bands WHERE id = "${id}"`)
        if (!bandExists) {
            throw new Error("id da banda não encontrado")
        }
        const [nameExists]: {}[] = await db.raw(`SELECT * FROM bands WHERE name = "${name}";`)
        if (nameExists) {
            throw new Error("banda já existe no banco de dados")
        }
        const newEntry = await db.raw(`UPDATE bands SET name = "${name}" WHERE id = "${id}" `)
        res.status(201).send("banda alterada com sucesso")
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})
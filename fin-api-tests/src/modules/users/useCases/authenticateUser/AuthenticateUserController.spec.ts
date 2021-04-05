import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { app } from "../../../../app"
import {hash} from 'bcryptjs'
import {v4 as uuidV4} from 'uuid'

describe("Authenticate User Controller", () => {

    let connection: Connection
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

        const id = uuidV4();
        const password = await hash("test", 8);

        await connection.query(
            `INSERT INTO users (id, name, email, password, created_at, updated_at)
            VALUES('${id}', 'test', 'test@email', '${password}', 'now()', 'now()')
            `
        )
    })

    afterAll(async ()=> {
        await connection.dropDatabase()
        await connection.close()
    })

    it("Should be able to create a new session", async ()=> {
        const response = await request(app).post('/api/v1/sessions').send({
            email:'test@email',
            password: 'test'
        })

        expect(response.body).toHaveProperty('token')
        expect(response.body).toHaveProperty('user')
    })

    it("Should not be able to create a new session if the email is wrong", async ()=> {
        const response = await request(app).post('/api/v1/sessions').send({
            email:'wrongEmail',
            password: 'test'
        })

        expect(response.status).toBe(401)
    })

    it("Should not be able to create a new session if the password is wrong", async ()=> {
        const response = await request(app).post('/api/v1/sessions').send({
            email:'test@email',
            password: 'wrongPassword'
        })

        expect(response.status).toBe(401)
    })

})
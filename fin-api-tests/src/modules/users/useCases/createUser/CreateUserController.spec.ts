import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { app } from "../../../../app"

describe("Create User Controller", () => {

    let connection: Connection
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()
    })

    afterAll(async ()=> {
        await connection.dropDatabase()
        await connection.close()
    })

    it("Should be able to create a new user", async ()=> {
        const response = await request(app).post('/api/v1/users').send({
            name:'test',
            email:'test@email',
            password:'test'
        })

        expect(response.status).toBe(201)
    })

    it("Should not be able to create a new user with an email already taken", async ()=> {
        const response = await request(app).post('/api/v1/users').send({
            name:'test2',
            email:'test@email',
            password:'test2'
        })

        expect(response.status).toBe(400)
    })
})
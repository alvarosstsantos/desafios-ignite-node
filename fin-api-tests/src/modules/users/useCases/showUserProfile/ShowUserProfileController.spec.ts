import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { app } from "../../../../app"
import {hash} from 'bcryptjs'
import {v4 as uuidV4} from 'uuid'

describe("Show User Profile Controller", () => {

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

    it("Should be able to get user profile", async ()=> {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email:'test@email',
            password: 'test'
        })

        const { token } = responseToken.body

        const response = await request(app).get('/api/v1/profile')
        .set({ Authorization: `Bearer ${token}` });

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('email','test@email')

    })

    it("Should not be able to get user profile if token is invalid", async ()=> {
        const response = await request(app).get('/api/v1/profile')
        .set({ Authorization: `Bearer invalidToken` });

        expect(response.status).toBe(401)
    })

    it("Should not be able to get user profile if token is missing", async ()=> {
        const response = await request(app).get('/api/v1/profile')

        expect(response.status).toBe(401)
    })

})
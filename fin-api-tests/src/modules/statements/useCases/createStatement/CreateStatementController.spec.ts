import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { app } from "../../../../app"
import {hash} from 'bcryptjs'
import {v4 as uuidV4} from 'uuid'

describe("Create Statement Controller", () => {

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

    it("Should be able to create a deposit statement", async ()=> {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email:'test@email',
            password: 'test'
        })

        const { token } = responseToken.body

        const deposit = {
            amount:100,
            description:'test'
        }

        const response = await request(app).post('/api/v1/statements/deposit')
        .send(deposit)
        .set({ Authorization: `Bearer ${token}` });

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('amount',deposit.amount)
        expect(response.body).toHaveProperty('description',deposit.description)

    })

    it("Should not be able to create deposit statement if token is invalid", async ()=> {
        const deposit = {
            amount:100,
            description:'test'
        }

        const response = await request(app).post('/api/v1/statements/deposit')
        .send(deposit)
        .set({ Authorization: `Bearer invalidToken` });

        expect(response.status).toBe(401)
    })

    it("Should not be able to create deposit statement if token is missing", async ()=> {
        const deposit = {
            amount:100,
            description:'test'
        }

        const response = await request(app).post('/api/v1/statements/deposit')
        .send(deposit)

        expect(response.status).toBe(401)
    })

    it("Should not be able to create a withdraw statement if insufficient funds", async ()=> {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email:'test@email',
            password: 'test'
        })

        const { token } = responseToken.body

        const withdraw = {
            amount:200,
            description:'test'
        }

        const response = await request(app).post('/api/v1/statements/withdraw')
        .send(withdraw)
        .set({ Authorization: `Bearer ${token}` });

        expect(response.status).toBe(400)
    })

    it("Should be able to create a withdraw statement", async ()=> {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email:'test@email',
            password: 'test'
        })

        const { token } = responseToken.body

        const withdraw = {
            amount:50,
            description:'test'
        }

        const response = await request(app).post('/api/v1/statements/withdraw')
        .send(withdraw)
        .set({ Authorization: `Bearer ${token}` });

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('amount',withdraw.amount)
        expect(response.body).toHaveProperty('description',withdraw.description)
    })

    it("Should not be able to create withdraw statement if token is invalid", async ()=> {
        const withdraw = {
            amount:25,
            description:'test'
        }

        const response = await request(app).post('/api/v1/statements/withdraw')
        .send(withdraw)
        .set({ Authorization: `Bearer invalidToken` });

        expect(response.status).toBe(401)
    })

    it("Should not be able to create withdraw statement if token is missing", async ()=> {
        const withdraw = {
            amount:25,
            description:'test'
        }

        const response = await request(app).post('/api/v1/statements/withdraw')
        .send(withdraw)

        expect(response.status).toBe(401)
    })

})
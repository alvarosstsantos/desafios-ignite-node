import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { app } from "../../../../app"
import {hash} from 'bcryptjs'
import {v4 as uuidV4} from 'uuid'

describe("Get Operation Statement Controller", () => {

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

    it("Should be able to get user's balance", async ()=> {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email:'test@email',
            password: 'test'
        })

        const { token } = responseToken.body

        const deposit = {
            amount:100.00,
            description:'test'
        }

        const statement = await request(app).post('/api/v1/statements/deposit')
        .send(deposit)
        .set({ Authorization: `Bearer ${token}` });

        const {id: statement_id } = statement.body

        const response = await request(app).get(`/api/v1/statements/${statement_id}`)
        .set({ Authorization: `Bearer ${token}` });

        expect(response.body.id).toEqual(statement.body.id)
        expect(parseInt(response.body.amount,10)).toEqual(statement.body.amount)

    })


})
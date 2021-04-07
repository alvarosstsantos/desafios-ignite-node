import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { app } from "../../../../app"
import {hash} from 'bcryptjs'
import {v4 as uuidV4} from 'uuid'

import { sign } from 'jsonwebtoken';

import authConfig from '../../../../config/auth';
import { GetBalanceError } from "./GetBalanceError"

describe("Get Balance Controller", () => {

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
            amount:100,
            description:'test'
        }

        await request(app).post('/api/v1/statements/deposit')
        .send(deposit)
        .set({ Authorization: `Bearer ${token}` });

        const withdraw = {
            amount:25,
            description:'test'
        }

        await request(app).post('/api/v1/statements/withdraw')
        .send(withdraw)
        .set({ Authorization: `Bearer ${token}` });

        const response = await request(app).get('/api/v1/statements/balance')
        .set({ Authorization: `Bearer ${token}` });

        expect(response.body.statement.length).toEqual(2)
        expect(response.body.balance).toEqual(75)
        expect(response.status).toBe(200)

    })

    it('Should not be able to get balance if user does not exists', async ()=> {

        try {
            const { secret, expiresIn } = authConfig.jwt;

            const user = {
                id: 'test',
                name: 'test',
                email: 'test@test',
                password: 'test',
                created_at: new Date(),
                updated_at: new Date(),
            }

            const token = sign({ user }, secret, {
              subject: user.id,
              expiresIn,
            });

            await request(app).get('/api/v1/statements/balance')
            .set({ Authorization: `Bearer ${token}` });
        } catch (error) {
            expect(error).toBeInstanceOf(GetBalanceError)
        }

    })

})
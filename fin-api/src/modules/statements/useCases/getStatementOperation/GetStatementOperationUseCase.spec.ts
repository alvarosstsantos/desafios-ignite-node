import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"
import {GetStatementOperationError} from './GetStatementOperationError'


enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

describe("Create Statement", ()=> {
    let inMemoryUsersRepository: InMemoryUsersRepository
    let inMemoryStatementsRepository: InMemoryStatementsRepository
    let createUserUseCase: CreateUserUseCase
    let createStatementUseCase: CreateStatementUseCase
    let getStatementOperationUseCase: GetStatementOperationUseCase

    beforeEach(async ()=>{
        inMemoryUsersRepository = new InMemoryUsersRepository()
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,inMemoryStatementsRepository)
        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository,inMemoryStatementsRepository)

    });

    it("Should be able to get statement", async ()=> {

        const user = await createUserUseCase.execute({
            name:'test',
            email: 'test2@email',
            password:'test'
        })

        const statement = await createStatementUseCase.execute({
            user_id: user.id,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: 'test',
        })

        const result = await getStatementOperationUseCase.execute({
            user_id: user.id,
            statement_id:statement.id
        })

        expect(result).toHaveProperty('id', statement.id)
        expect(result).toHaveProperty('description', 'test')
    });

    // it("Should not be able to get statement from unexisting user",()=> {

    //     expect(async ()=>{
    //         const user = await createUserUseCase.execute({
    //             name:'test',
    //             email: 'test1@email',
    //             password:'test'
    //         })
    
    //         const statement = await createStatementUseCase.execute({
    //             user_id: user.id,
    //             type: OperationType.DEPOSIT,
    //             amount: 100,
    //             description: 'test',
    //         })

    //         await getStatementOperationUseCase.execute({
    //             user_id: 'unexistingUserId',
    //             statement_id:statement.id})
    //     }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    // });

    it("Should not be able to get statement from unexisting user", async ()=> {
        try {
            const user = await createUserUseCase.execute({
                name:'test',
                email: 'test1@email',
                password:'test'
            })
    
            const statement = await createStatementUseCase.execute({
                user_id: user.id,
                type: OperationType.DEPOSIT,
                amount: 100,
                description: 'test',
            })

            await getStatementOperationUseCase.execute({
                user_id: 'unexistingUserId',
                statement_id:statement.id})
        } catch (error) {
                expect(error).toBeInstanceOf(GetStatementOperationError.UserNotFound)
        }

    })

    it("Should not be able to get unexisting statement",()=> {

        expect(async ()=>{

            const user = await createUserUseCase.execute({
                name:'test',
                email: 'test3@email',
                password:'test'
            })
    
            await getStatementOperationUseCase.execute({
                user_id: user.id,
                statement_id:'unexistingStatementId'})
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    });


})


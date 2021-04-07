import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateStatementDTO } from "./ICreateStatementDTO"
import { CreateStatementError } from "./CreateStatementError";



enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

describe("Create Statement", ()=> {
    let inMemoryUsersRepository: InMemoryUsersRepository
    let inMemoryStatementsRepository: InMemoryStatementsRepository
    let createUserUseCase: CreateUserUseCase
    let createStatementUseCase: CreateStatementUseCase

    beforeEach(()=>{
        inMemoryUsersRepository = new InMemoryUsersRepository()
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,inMemoryStatementsRepository)
    });

    it("Should not be able create statement for unexisting user",()=> {
        expect(async()=>{
            const statement3: ICreateStatementDTO = {
                user_id: 'unexistingUserId',
                type: OperationType.DEPOSIT,
                amount: 100,
                description: 'test3',
            }
    
            await createStatementUseCase.execute(statement3)
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    });

    it("Should be able create a statement", async ()=> {

        const user1 = await createUserUseCase.execute({
            name:'test1',
            email: 'test1@email',
            password:'test1'
        })


        const statement1: ICreateStatementDTO = {
            user_id: user1.id,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: 'test1',
        }

        const result = await createStatementUseCase.execute(statement1)

        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('description', 'test1')
    });

    it("Should be not be able create withdraw statement with insufient funds",()=> {

        expect(async ()=>{

            const user2 = await createUserUseCase.execute({
                name:'test2',
                email: 'test2@email',
                password:'test2'
            })
    
            const statement2: ICreateStatementDTO = {
                user_id: user2.id,
                type: OperationType.WITHDRAW,
                amount: 100,
                description: 'test2',
            }
    
            await createStatementUseCase.execute(statement2)

        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
    });

})


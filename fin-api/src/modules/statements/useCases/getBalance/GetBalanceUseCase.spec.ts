import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceUseCase } from "./GetBalanceUseCase"
import { GetBalanceError } from "./GetBalanceError"



enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

describe("Create Statement", ()=> {
    let inMemoryUsersRepository: InMemoryUsersRepository
    let inMemoryStatementsRepository: InMemoryStatementsRepository
    let createUserUseCase: CreateUserUseCase
    let createStatementUseCase: CreateStatementUseCase
    let getBalanceUseCase: GetBalanceUseCase

    beforeEach(async ()=>{
        inMemoryUsersRepository = new InMemoryUsersRepository()
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,inMemoryStatementsRepository)
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
    });

    it("Should be able to get balance", async ()=> {

        const user = await createUserUseCase.execute({
            name:'test',
            email: 'test@email',
            password:'test'
        })

        await createStatementUseCase.execute({
            user_id: user.id,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: 'test',
        })

        const balance = await getBalanceUseCase.execute({user_id:user.id})



        expect(balance).toHaveProperty('balance', 100)
        expect(balance.statement.length).toBe(1)
    });

    it("Should not be be able to get balance from unexisting user", ()=> {
        expect(async ()=>{
           return await getBalanceUseCase.execute({user_id:"unexistingUserId"});
        }).rejects.toBeInstanceOf(GetBalanceError)
    });


})


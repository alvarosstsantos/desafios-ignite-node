
import { compare } from "bcryptjs"
import { InMemoryUsersRepository } from "../../../../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"
import { ICreateUserDTO } from "./ICreateUserDTO"


describe("Create User", ()=> {
    let inMemoryUsersRepository: InMemoryUsersRepository
    let createUserUseCase: CreateUserUseCase

    beforeEach(()=>{
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    });

    it("Should be able to create a new user", async ()=>{
        const password = 'test'

        const user: ICreateUserDTO = {
            name:'test',
            email: 'test@email',
            password
        }

        const result = await createUserUseCase.execute(user)

        const passwordHash =  await compare(password, result.password)

        expect(result).toHaveProperty('name', 'test')
        expect(result).toHaveProperty('email', 'test@email')
        expect(passwordHash).toEqual(true)
    });

    it("Should not be able to create and user with name already taken", ()=>{
        expect(async ()=>{

            const user1: ICreateUserDTO = {
                name:'test1',
                email: 'test@email',
                password:'test1'
            }

            const user2: ICreateUserDTO = {
                name:'test2',
                email: 'test@email',
                password: 'test2'
            }

            await createUserUseCase.execute(user1)
            await createUserUseCase.execute(user2)
        }).rejects.toBeInstanceOf(CreateUserError)
    });
})
import { InMemoryUsersRepository } from "../../../../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"



describe("Create User", ()=> {
    let inMemoryUsersRepository: InMemoryUsersRepository
    let createUserUseCase: CreateUserUseCase
    let authenticateUserUseCase: AuthenticateUserUseCase

    beforeEach(()=>{
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    });

    it("Should be able to authenticate user", async ()=> {
        const user: ICreateUserDTO = {
            name:'test',
            email: 'test@email',
            password: 'test'
        }

        await createUserUseCase.execute(user)

        const result = await authenticateUserUseCase.execute({email:user.email,
                                                             password: user.password})

        expect(result).toHaveProperty('token')
    })

    it("Should not be able to Authenticate with incorrect password", ()=>{
        expect(async ()=>{

            const user: ICreateUserDTO = {
                name:'test',
                email: 'test@email',
                password: 'test'
            }

            await createUserUseCase.execute(user)

            await authenticateUserUseCase.execute({email:user.email,
                                                   password: 'wrondPassword'})

        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    });

    it("Should not be able to Authenticate with incorrect email", ()=>{
        expect(async ()=>{

            const user: ICreateUserDTO = {
                name:'test',
                email: 'test@email',
                password: 'test'
            }

            await createUserUseCase.execute(user)

            await authenticateUserUseCase.execute({email:'wrongEmail',
                                                   password: user.password})

        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    });
})
import { InMemoryUsersRepository } from "../../../../modules/users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"



describe("Create User", ()=> {
    let inMemoryUsersRepository: InMemoryUsersRepository
    let createUserUseCase: CreateUserUseCase
    let showUserProfileUseCase: ShowUserProfileUseCase
    let authenticateUserUseCase: AuthenticateUserUseCase

    beforeEach(()=>{
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    });

    it("Should be able show user profile", async ()=> {
        const user: ICreateUserDTO = {
            name:'test',
            email: 'test@email',
            password: 'test'
        }

        await createUserUseCase.execute(user)

        const auth = await authenticateUserUseCase.execute({email:user.email, password: user.password})

        const result = await showUserProfileUseCase.execute(auth.user.id)

        expect(result).toHaveProperty('name', 'test')
        expect(result).toHaveProperty('email', 'test@email')
    })


    it("Should not be able to show profile of unexisting user", ()=>{
        expect(async ()=>{

            await showUserProfileUseCase.execute('unexistingUser')

        }).rejects.toBeInstanceOf(ShowUserProfileError)
    });
})
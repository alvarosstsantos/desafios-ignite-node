import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementError } from "./CreateTransferStatementError";
import { ICreateStatementDTO } from "../../dtos/ICreateStatementDTO";

@injectable()
export class CreateTransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, amount, description, sender_id }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(sender_id);

    if(!user) {
      throw new CreateTransferStatementError.UserNotFound();
    }
    const recipient = await this.usersRepository.findById(user_id);

    if(!recipient) {
      throw new CreateTransferStatementError.RecipientNotFound();
    }

      const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

      if (balance < amount) {
        throw new CreateTransferStatementError.InsufficientFunds()
      }

    await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      sender_id
    });

    const statementOperation = await this.statementsRepository.create({
      user_id: sender_id,
      type,
      amount,
      description,
    });

    return statementOperation;
  }
}

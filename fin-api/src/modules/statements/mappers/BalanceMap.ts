import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({statement, balance}: { statement: Statement[], balance: number}) {
    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at,
      sender_id
    }) =>
      ({
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
        sender_id
      })
    )

    const statementWithoutNullProperties = parsedStatement.map((statement) => (
      Object.keys(statement)
            .filter((key) => statement[key] != null)
            .reduce((acc, key) => ({ ...acc, [key]: statement[key] }), {})
    ))

    return {
      statement: statementWithoutNullProperties,
      balance: Number(balance)
    }
  }
}

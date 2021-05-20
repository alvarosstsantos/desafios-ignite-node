import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient"
import { v4 as uuidV4 } from "uuid"

interface ICreateTodo {
    title: string;
    deadline: string;
}


export const handle:APIGatewayProxyHandler = async (event) => {
    const { userid } = event.pathParameters
    const { title, deadline } = JSON.parse(event.body) as ICreateTodo


    await document.put({
        TableName: "users_todos",
        Item: {
            id: uuidV4(),
            user_id: userid,
            title,
            done: false,
            deadline: (new Date(deadline)).toISOString()
        }
    }).promise()

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "todo created"
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }
}
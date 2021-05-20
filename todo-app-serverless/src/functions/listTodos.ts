import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient"


export const handle:APIGatewayProxyHandler = async (event) => {
    const { userid } = event.pathParameters

    const response = await document.query({
        TableName: "users_todos",
        KeyConditionExpression: "user_id = :user_id",
        ExpressionAttributeValues: {
            ":user_id": userid
        }
    }).promise()

    return {
        statusCode: 200,
        body: JSON.stringify(response.Items)
    }
}
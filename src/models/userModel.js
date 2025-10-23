// Import AWS SDK v3 DynamoDB clients
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand
} from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Client
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
});

// DynamoDB Document Client
const dynamo = DynamoDBDocumentClient.from(client);

// DynamoDB table name
const TABLE_NAME = "Users";

/**
 * Create User
 */
export const createUser = async (user) => {
    await dynamo.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: user,
        ConditionExpression: "attribute_not_exists(userId)"
    }));
    return user;
};

/**
 * ✅ Get User by Email (REQUIRED FOR AUTH)
 */
export const getUserByEmail = async (email) => {
    const params = {
        TableName: TABLE_NAME,
        IndexName: "email-index", // MUST exist in DynamoDB
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    };

    const result = await dynamo.send(new QueryCommand(params));
    return result.Items?.[0]; // return first match
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
    const result = await dynamo.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId }
    }));
    return result.Item;
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
    const result = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));
    return result.Items;
};

/**
 * Update user
 */
export const updateUser = async (userId, updates) => {
    const fields = Object.keys(updates);

    const updateExpression = `SET ${fields.map((f) => `#${f} = :${f}`).join(", ")}`;

    const expressionAttributeNames = fields.reduce((acc, f) => {
        acc[`#${f}`] = f;
        return acc;
    }, {});

    const expressionAttributeValues = fields.reduce((acc, f) => {
        acc[`:${f}`] = updates[f];
        return acc;
    }, {});

    const result = await dynamo.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
    }));

    return result.Attributes;
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
    await dynamo.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId }
    }));
    return { message: "User deleted successfully" };
};

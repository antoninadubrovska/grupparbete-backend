import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { accessKey, secretAccessKey } from "./keys.js";

const client: DynamoDBClient = new DynamoDBClient({
	region: "eu-north-1",
	credentials: {
		accessKeyId: accessKey,
		secretAccessKey: secretAccessKey,
	},
});

const db: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

export default db;
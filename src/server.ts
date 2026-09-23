import express, { type Express } from "express";

// TODO DynamoDB

const app: Express = express();

const port: number = 3000;

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Webshop API is running!");
});

app.listen(port, () => {
	console.log(`Server is listening on port ${port}...`);
});
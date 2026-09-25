import express, { type Express, type RequestHandler } from "express";
import { formatTimestamp } from "./timeUtilities.js";

const app: Express = express();

const port: number = 3000;

const logger: RequestHandler = (req, res, next) => {
	const now = formatTimestamp();
	console.log(`${now}  ${req.method}  ${req.url}`);
	next();
};

app.use("/", logger);
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Webshop API is running!");
});

app.listen(port, () => {
	console.log(`Server is listening on port ${port}...`);
});
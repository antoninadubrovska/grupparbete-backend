import express, { type Express, type RequestHandler } from "express";
import { formatTimestamp } from "./timeUtilities.js";
import usersRouter from "./routes/user.js";
import productsRouter from "./routes/product.ts"
import cors from "cors";


const app: Express = express();

// app.use( express.static('./static/') )
app.use(cors({
	origin: "http://127.0.0.1:5500"
  }));

	app.use( express.static('./frontend') )
	
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

// mount routers
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);




app.listen(port, () => {
	console.log(`Server is listening on port ${port}...`);
});

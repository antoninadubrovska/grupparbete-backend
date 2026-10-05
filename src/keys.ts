const accessKey: string = process.env.ACCESS_KEY!;
const secretAccessKey: string = process.env.SECRET_ACCESS_KEY!;

if (!accessKey || !secretAccessKey) {
	console.log("No AWS keys found! Check your .env file.");
	process.exit(1);
}

export { accessKey, secretAccessKey };
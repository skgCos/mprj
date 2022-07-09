import express from "express";
import commandLineArgs from "command-line-args";
import routes from "./routes";
import dbManager from "./dbManager";
/**
 * App init
 */

// Get required command line args
const optionDefinitions = [
    {name: "port", alias: "v", type: Number}
];
const options = commandLineArgs(optionDefinitions);

if(options.port === undefined) {
    console.error("Please specify on which port the server should listen. i.e. --port 8080");
    process.exit(-1);
}

const PORT = options.port;

// Create express app
const app = express();

/**
 * Middlewares
 */
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

/**
 * Routes
 */

// Data
app.post("/data", routes.dataPOSTHandler); // save data
app.get("/data", routes.dataGETHandler); // retrive data
app.all("/data", routes.wrongMethodHandler); // wrong method

// Average
app.get("/average", routes.averageGETHandler); // retrieve average
app.all("/average", routes.wrongMethodHandler); // wrong method

// All the other routes
app.all("*", (req: express.Request, res: express.Response) => {
    res.status(404);
    res.end();
});

/**
 * Error Middleware
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Add issue to error tracker like Sentry
    console.error(err.name);
    res.status(500);
    res.end();
});

/**
 * Exception tracker
 */
process.on("uncaughtException", function(err) {
    // Add issue to error tracker like Sentry
    console.error("Uncaught Exception:", err);
    process.exit(-99);
});

/**
 * Server start
 */
app.listen(PORT, async () => {
    console.log("Server listening on", PORT);

    // Connect to DB
    await dbManager.connect();

    // Start enqueuer
    dbManager.startInsertBundlerTask();
});
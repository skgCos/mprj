import express from "express";
import commandLineArgs from "command-line-args";
import routes from "./routes";
import dbManager from "./dbManager";
import rateLimit from "express-rate-limit";
import {logger, loggerMiddleware} from "./logger";
/**
 * App init
 */

// Get required command line args
const optionDefinitions = [
    {name: "port", alias: "p", type: Number},
    {name: "requestsPerHour", alias: "r", type: Number},
    {name: "enqueuerEnabled", alias: "e", type: Boolean}
];
const options = commandLineArgs(optionDefinitions);

// Port argument
if(options.port === undefined) {
    logger.error("Please specify on which port the server should listen. i.e. --port 8080");
    process.exit(-1);
}

// Request per hour argument
if(options.requestsPerHour === undefined) {
    logger.error("Please specify the limit of request per hour for each IP. i.e. --requestsPerHour 1000");
    process.exit(-2);
}

const PORT: number = options.port;
const REQUEST_PER_HOUR = options.requestsPerHour;

// Create express app
const app = express();

/**
 * Middlewares
 */

// JSON body parser
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Rate limiter
const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1h
    max: REQUEST_PER_HOUR
});
app.use(rateLimiter);

// Logger
app.use(loggerMiddleware);

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
    logger.error("Server Error", err);
    res.status(500);
    res.end();
});

/**
 * Exception tracker
 */
process.on("uncaughtException", function(err) {
    // Add issue to error tracker like Sentry
    logger.error("Uncaught Exception:", err);
    process.exit(-99);
});

/**
 * Server start
 */
app.listen(PORT, async () => {
    logger.info(`Server listening on port ${PORT}`);

    // Connect to DB
    await dbManager.connect();

    // Start enqueuer
    if(options.enqueuerEnabled as boolean) {
        dbManager.startInsertBundlerTask();
    }
});
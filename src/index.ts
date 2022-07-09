import express from "express";
import routes from "./routes";
const app = express();

// Middleware for json body parsing
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.listen(8081, () => {
    console.log("App started");
});

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

// Middleware for error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Add issue to error tracker like sentry
    console.error(err.name);
    res.status(500);
    res.end();
});
import express from "express";
import {body, query, validationResult} from "express-validator";

const dataPOSTHandler = [
    // Validate
    body("voltage").isFloat(),
    body("timestamp").isInt(),
    // Process
    (req: express.Request, res: express.Response): void => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()) {
            res.status(400).json({errors: validationErrors.array()});
            return;
        }

        res.send("Handler data POST");
    }
];

const dataGETHandler = [
    // Validate
    query("n").isInt(),
    // Process
    (req: express.Request, res: express.Response): void => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()) {
            res.status(400).json({errors: validationErrors.array()});
            return;
        }

        res.send("Handler data GET");
    }
];

const averageGETHandler = [
    // Validate
    query("n").isInt(),
    // Process
    (req: express.Request, res: express.Response): void => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()) {
            res.status(400).json({errors: validationErrors.array()});
            return;
        }

        res.send("Handler average GET");
    }
];

function wrongMethodHandler(req: express.Request, res: express.Response): void {
    res.status(405).send("Wrong method");
}

export default {
    dataGETHandler,
    dataPOSTHandler,
    averageGETHandler,
    wrongMethodHandler
};
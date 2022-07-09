import express from "express";
import {body, query, validationResult} from "express-validator";
import dbManager from "./dbManager";

interface VoltageSeriesDocument {
    voltage: number;
    timestamp: number;
}

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

        // Enqueue to db
        dbManager.enqueueInsert<VoltageSeriesDocument>("voltageSeries", {
            voltage: req.body.voltage,
            timestamp: req.body.timestamp
        });

        res.status(200).end();
    }
];

const dataGETHandler = [
    // Validate
    query("n").isInt(),
    // Process
    async (req: express.Request, res: express.Response): Promise<void> => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()) {
            res.status(400).json({errors: validationErrors.array()});
            return;
        }
        const n = parseInt(req.query.n as string);
        const voltageData = await dbManager.findNElementsFromCollection<Array<VoltageSeriesDocument>>(
            "voltageSeries",
            n,
            {timestamp: -1},
            {_id: 0}
        );
        res.status(200).json(voltageData);
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
import express from "express";
import {body, query, validationResult} from "express-validator";
import dbManager from "./dbManager";

interface VoltageSeriesDocument {
    voltage: number;
    timestamp: number;
}

interface VoltageAverageDocument {
    average: number;
    n: number;
}

interface ResponseTemplate {
    data: any;
    errors: any;
}

const dataPOSTHandler = [
    // Validate
    body("voltage").isFloat(),
    body("timestamp").isInt(),
    // Process
    async (req: express.Request, res: express.Response): Promise<void> => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()) {
            res.status(400).json({errors: validationErrors.array()});
            return;
        }

        // Enqueue to db
        void dbManager.enqueueInsert<VoltageSeriesDocument>("voltageSeries", {
            voltage: parseFloat(req.body.voltage),
            timestamp: parseFloat(req.body.timestamp)
        });

        const responseObj: ResponseTemplate = {
            data: null,
            errors: new Array<any>()
        };

        // Success
        res.status(200).json(responseObj);
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

        const responseObj: ResponseTemplate = {
            data: voltageData,
            errors: new Array<any>()
        };

        res.status(200).json(responseObj);
    }
];

const averageGETHandler = [
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
        const voltageAverageData = await dbManager.findAverageOfNElementsFromCollection<VoltageAverageDocument>(
            "voltageSeries",
            n,
            {timestamp: -1},
            {_id: 0},
            "$voltage"
        );

        const responseObj: ResponseTemplate = {
            data: voltageAverageData,
            errors: new Array<any>()
        };

        // When average was requested but there's no data in the database
        if(voltageAverageData === null) {
            // Overwrite data with valid null response
            responseObj.data = {
                n,
                average: null
            };
            res.status(200).json(responseObj);
            return;
        }

        // Append N as per spec
        voltageAverageData.n = n;

        res.status(200).json(responseObj);
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
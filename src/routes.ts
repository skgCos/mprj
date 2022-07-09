import express from "express";

function dataPOSTHandler(req: express.Request, res: express.Response): void {
    res.send("Handler data POST");
}

function dataGETHandler(req: express.Request, res: express.Response): void {
    res.send("Handler data GET");
}

function averageGETHandler(req: express.Request, res: express.Response): void {
    res.send("Handler average GET");
}

function wrongMethodHandler(req: express.Request, res: express.Response): void {
    res.status(405).send("Wrong method");
}

export default {
    dataGETHandler,
    dataPOSTHandler,
    averageGETHandler,
    wrongMethodHandler
};
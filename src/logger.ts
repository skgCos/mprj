import winston from "winston";
import express from "express";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json()
});

if(process.env.NODE_ENV !== "production") {
    // Pretty print meta for debugging
    logger.add(new winston.transports.Console({
        format: winston.format.printf(({level, message, ...meta}) => {
            return `${level}: ${message as string} ${Object.keys(meta).length !== 0 ? JSON.stringify(meta, null, 4) : ""}`;
        })
    }));
} else {
    // Add production meta
    logger.defaultMeta = {app: "mprj"};
}

const loggerMiddleware = function(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const ogEnd = res.end;
    let errorResponseBuffer: Buffer;

    res.end = function(chunk) {
        if(res.statusCode !== 200 && chunk as boolean) {
            errorResponseBuffer = Buffer.from(chunk);
        }
        ogEnd.apply(res, arguments);
        return res;
    };

    res.on("finish", () => {
        const logObj: any = {
            reqMethod: req.method,
            reqIP: req.ip,
            reqURL: req.url,
            reqData: req.body,
            date: new Date().toUTCString()
        };

        // Append response to logObj
        if(res.statusCode !== 200) {
            logObj.resData = errorResponseBuffer.toString("utf-8");
            logger.error("New Request", logObj);
        } else {
            logger.info("New request", logObj);
        }
    });

    next();
};

export {
    logger,
    loggerMiddleware
};
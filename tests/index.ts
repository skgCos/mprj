import assert from "assert";
import dbManager from "../src/dbManager";
import utils from "./utils";
import fetch from "node-fetch";

describe("Setting up environment", () => {
    it("should delete all from database", async function() {
        this.timeout(5000);
        await dbManager.connect();
        await dbManager.deleteAllFromCollection("voltageSeries");
    });
    it("should start the server", async function() {
        utils.startProcess("node dist/app.js --port 8081 --requestsPerHour 100");
    });
    it("should wait for server startup", async function() {
        this.timeout(10000);
        await utils.waitFor(1000);
    });
});

const testValues = utils.generateRandomArray(10);

describe("Testing the API", function() {
    this.timeout(5000);
    it("should retrieve 1 value when there are none", async function() {
        const res = await utils.GETFetch("http://127.0.0.1:8081/data?n=1");
        assert.equal(JSON.parse(res.body).length, 0);
    });

    it("should retrieve the average when there are no values", async function() {
        const res = await utils.GETFetch("http://127.0.0.1:8081/average?n=1");
        assert.equal(JSON.parse(res.body).average, null);
    });

    it("should insert test value", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/data", {
            voltage: testValues[0],
            timestamp: utils.getUNIXTimestampMs()
        });
        assert.equal(res.status, 200);
    });

    it("should retrieve 1 value", async function() {
        await utils.waitFor(100); // Wait to be sure values have been stored in db
        const res = await utils.GETFetch("http://127.0.0.1:8081/data?n=1");
        assert.equal(JSON.parse(res.body)[0].voltage, testValues[0]);
    });

    it("should insert other test values", async function() {
        for(let i = 1; i < 10; i++) {
            const res = await utils.POSTFetch("http://127.0.0.1:8081/data", {
                voltage: testValues[i],
                timestamp: utils.getUNIXTimestampMs()
            });
            assert.equal(res.status, 200);
        }
    });

    it("should retrieve 2 value", async function() {
        await utils.waitFor(100); // Wait to be sure values have been stored in db
        const res = await utils.GETFetch("http://127.0.0.1:8081/data?n=2");
        assert.equal(JSON.parse(res.body)[0].voltage, testValues[9]);
        assert.equal(JSON.parse(res.body)[1].voltage, testValues[8]);
    });

    it("should retrieve average of last 2 values", async function() {
        const res = await utils.GETFetch("http://127.0.0.1:8081/average?n=2");
        assert.equal(JSON.parse(res.body).average.toFixed(2), utils.calculateArrayAverage(testValues, 8, 10).toFixed(2));
    });

    it("should retrieve average of last 6 values", async function() {
        const res = await utils.GETFetch("http://127.0.0.1:8081/average?n=6");
        assert.equal(JSON.parse(res.body).average.toFixed(2), utils.calculateArrayAverage(testValues, 4, 10).toFixed(2));
    });

    it("should fail to retrieve the average since n is missing", async function() {
        const res = await utils.GETFetch("http://127.0.0.1:8081/average");
        assert.equal(res.status, 400);
    });

    it("should fail to retrieve the average since n is a string", async function() {
        const res = await utils.GETFetch("http://127.0.0.1:8081/average?n=someValue");
        assert.equal(res.status, 400);
    });

    it("should fail to insert data since voltage is missing", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/data", {
            timestamp: utils.getUNIXTimestampMs()
        });
        assert.equal(res.status, 400);
    });

    it("should fail to insert data since timestamp is missing", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/data", {
            voltage: testValues[0]
        });
        assert.equal(res.status, 400);
    });

    it("should fail to insert data since voltage is invalid", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/data", {
            voltage: "testValues"
        });
        assert.equal(res.status, 400);
    });

    it("should fail to insert data since timestamp is invalid", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/data", {
            timestamp: "testValues"
        });
        assert.equal(res.status, 400);
    });

    it("should fail to POST to average route", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/average", {});
        assert.equal(res.status, 405);
    });

    it("should fail to PUT to data route", async function() {
        const res = await fetch("http://127.0.0.1:8081/data", {method: "PUT"});
        assert.equal(res.status, 405);
    });

    it("should not find an invalid route", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/invalidRoute", {});
        assert.equal(res.status, 404);
    });

    it("should close the server", async function() {
        utils.stopProcess();
    });

    it("should start the server with --requestsPerHour 2", async function() {
        utils.startProcess("node dist/app.js --port 8081 --requestsPerHour 2");
        await utils.waitFor(1000);
    });

    it("should rate limit", async function() {
        await utils.GETFetch("http://127.0.0.1:8081/data?n=2");
        await utils.GETFetch("http://127.0.0.1:8081/data?n=2");
        const res = await utils.GETFetch("http://127.0.0.1:8081/data?n=2");
        assert.equal(res.status, 429);
    });
});

describe("Cleanup", () => {
    it("should stop the server", async function() {
        utils.stopProcess();
    });
    it("should exit", function() {
        process.exit(0);
    });
});
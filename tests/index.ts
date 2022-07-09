import assert from "assert";
import dbManager from "../src/dbManager";
import utils from "./utils";

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

describe("Testing the API", () => {
    it("should insert test value", async function() {
        const res = await utils.POSTFetch("http://127.0.0.1:8081/data", {
            voltage: 1.1,
            timestamp: utils.getUNIXTimestamp()
        });
        assert.equal(res.status, 200);
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
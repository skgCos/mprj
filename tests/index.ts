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
        await utils.waitFor(5000);
    });
});

describe("Testing the API", () => {
    it("should insert test value", async function() {
        const resp = await fetch("http://127.0.0.1:8081/data", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                voltage: 2.2,
                timestamp: utils.getUNIXTimestamp()
            })
        });
        assert.equal(resp.status, 200);
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
import {spawn, ChildProcessWithoutNullStreams} from "child_process";
import fetch from "node-fetch";

let currentProcess: ChildProcessWithoutNullStreams | undefined;

function startProcess(cmd: string): void {
    const cmdArray = cmd.split(" ");
    currentProcess = spawn(cmdArray[0], cmdArray.slice(1));
}

function stopProcess(): void {
    if(currentProcess === undefined) {
        throw new Error("Cannot stop a process before starting one");
    }
    currentProcess.kill();
}

async function waitFor(ms: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

function getUNIXTimestampMs(): number {
    return Math.floor(new Date().getTime());
}

function generateRandomArray(n: number): Array<number> {
    const outArr = new Array<number>();
    for(let i = 0; i < n; i++) {
        outArr.push(parseFloat((Math.random() * 100).toFixed(2)));
    }
    return outArr;
}

// End is not inclusive
function calculateArrayAverage(array: Array<number>, startIndex: number, endIndex: number): number {
    let sum = 0;
    for(let i = startIndex; i < endIndex; i++) {
        sum += array[i];
    }
    return sum / (endIndex - startIndex);
}

interface FetchResult {
    body: string;
    status: number;
}

async function POSTFetch(url: string, body: any): Promise<FetchResult> {
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    return {
        status: resp.status,
        body: await resp.text()
    };
}

async function GETFetch(url: string): Promise<FetchResult> {
    const resp = await fetch(url);

    return {
        status: resp.status,
        body: await resp.text()
    };
}

export default {
    startProcess,
    stopProcess,
    waitFor,
    getUNIXTimestampMs,
    POSTFetch,
    GETFetch,
    generateRandomArray,
    calculateArrayAverage
};
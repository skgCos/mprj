import {spawn, ChildProcessWithoutNullStreams} from "child_process";
import fetch from "node-fetch";

let currentProcess: ChildProcessWithoutNullStreams | undefined;

/**
 * Starts specified process from specified cmd
 * @param cmd cmd line
 */
function startProcess(cmd: string): void {
    const cmdArray = cmd.split(" ");
    currentProcess = spawn(cmdArray[0], cmdArray.slice(1));
}

/**
 * Stops the process previously started
 */
function stopProcess(): void {
    if(currentProcess === undefined) {
        throw new Error("Cannot stop a process before starting one");
    }
    currentProcess.kill();
}

/**
 * Provides a quick way to wait for a determinate amount of time
 * @param ms time to wait in milliseconds
 * @returns A promise that will get resolved after the time requested
 */
async function waitFor(ms: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

/**
 * @returns A UNIX timestamp in milliseconds
 */
function getUNIXTimestampMs(): number {
    return Math.floor(new Date().getTime());
}

/**
 * Generates an array with random values
 * @param n number of elements to generate
 * @returns the array requested
 */
function generateRandomArray(n: number): Array<number> {
    const outArr = new Array<number>();
    for(let i = 0; i < n; i++) {
        outArr.push(parseFloat((Math.random() * 100).toFixed(2)));
    }
    return outArr;
}

/**
 * Calculates the average of the elements specified in the array
 * @param array the array of elements
 * @param startIndex inclusive start index
 * @param endIndex exclusive end index
 * @returns the requested average
 */
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

/**
 * Fetch wrapper for a POST request to an endpoint containing JSON data
 * @param url endpoint
 * @param body javascript object to be serialized
 * @returns promise with FetchResult
 */
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

/**
 * Fetch wrapper for a GET request to an endpoint
 * @param url endpoint
 * @returns promise with FetchResult
 */
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
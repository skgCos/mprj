import {spawn, ChildProcessWithoutNullStreams} from "child_process";

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

function getUNIXTimestamp(): number {
    return Math.floor(new Date().getTime() / 1000);
}

export default {
    startProcess,
    stopProcess,
    waitFor,
    getUNIXTimestamp
};
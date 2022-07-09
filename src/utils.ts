function verifyAndGetRequiredEnvVariable(varName: string): string {
    if(process.env[varName] === undefined) {
        throw new Error(`Required environment variable '${varName}' was not found`);
    }
    return process.env[varName] as string;
}

export default {
    verifyAndGetRequiredEnvVariable
};
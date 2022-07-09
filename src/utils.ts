/**
 * Verifies if environment variable is set.
 * @throws Error if evnviroment variable is not set
 * @param varName environment variable name
 * @returns value of requested environment variable
 */
function verifyAndGetRequiredEnvVariable(varName: string): string {
    if(process.env[varName] === undefined) {
        throw new Error(`Required environment variable '${varName}' was not found`);
    }
    return process.env[varName] as string;
}

export default {
    verifyAndGetRequiredEnvVariable
};
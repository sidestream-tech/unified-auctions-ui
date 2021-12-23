export const isDev = process.env.NODE_ENV !== 'production';

export const enforceEnvVariables = function (envVariableNames: string[]): void {
    for (const envVariableName of envVariableNames) {
        if (process.env[envVariableName]) {
            continue;
        }
        throw new Error(`process.env.${envVariableName} is missing`);
    }
};

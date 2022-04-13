import prompts from 'prompts';

const generateChoices = function (simulationIdsString: string) {
    try {
        const simulationsObject = JSON.parse(simulationIdsString);
        const simulationIds = Object.keys(simulationsObject);
        return simulationIds.map(simulationId => ({
            title: simulationsObject[simulationId],
            value: simulationId,
        }));
    } catch {
        throw new Error(`CHAOSLABS_SIMULATION_IDS is not in json format`);
    }
};

export const chooseSimulationId = async function (simulationIdsString: string): Promise<string> {
    const choices = generateChoices(simulationIdsString)
    if (choices.length === 1) {
        return choices[0].value;
    }
    const response = await prompts({
        name: 'simulationId',
        message: 'Please select simulation id',
        type: 'select',
        choices,
    });
    return response.simulationId;
};

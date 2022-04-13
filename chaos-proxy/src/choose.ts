import inquirer from 'inquirer';

const generateChoices = function (simulationIdsString: string) {
    return simulationIdsString.split(/,/g).map(s => s.trim());
};

export const chooseSimulationId = async function (simulationIdsString: string): Promise<string> {
    const choices = generateChoices(simulationIdsString)
    if (choices.length === 1) {
        return choices[0];
    }
    const question = {
        message: 'Please select simulation id',
        type: 'list',
        name: 'simulationId',
        choices,
    };
    const answers = await inquirer.prompt([question]);
    return answers.simulationId;
};

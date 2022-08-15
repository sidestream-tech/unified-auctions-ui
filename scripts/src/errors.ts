import colors from 'ansi-colors';
import { ARROW_EMOJI, ERROR_EMOJI } from './variables';

export const generateErrorsMessage = function (errors: string[]) {
    if (errors) {
        console.info(
            `\n\n${ARROW_EMOJI}${ERROR_EMOJI} While running the script encountered ${errors.length} error${
                errors.length !== 1 ? 's' : ''
            }:`
        );
        errors.forEach(error => {
            console.error(`${colors.red(ARROW_EMOJI + error)}`);
        });
    }
};

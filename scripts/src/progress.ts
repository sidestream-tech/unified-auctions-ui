import cliProgress from 'cli-progress';
import colors from 'ansi-colors';

export const setupProgressBar = function (autoStart?: boolean): cliProgress.SingleBar {
    const PROGRESS_BAR = new cliProgress.SingleBar(
        {
            format: colors.green('-[{bar}]-') + ' {percentage}% | {value}/{total} Collaterals | ETA: {eta_formatted}',
        },
        cliProgress.Presets.shades_classic
    );
    if (autoStart) {
        PROGRESS_BAR.start(100, 0);
    }
    return PROGRESS_BAR;
};

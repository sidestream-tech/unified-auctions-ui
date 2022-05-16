import { storiesOf } from '@storybook/vue';
import METAMASK_ERRORS from 'auctions-core/src/constants/METAMASK_ERRORS';
import parseMetamaskError from 'auctions-core/src/helpers/parseMetamaskError';

storiesOf('MetaMaskErrors', module).add('Plain', () => ({
    data: () => ({
        errors: METAMASK_ERRORS,
    }),
    methods: {
        parseMetamaskError(error) {
            return parseMetamaskError(error);
        },
    },
    template: `<div class="flex flex-col space-y-2">
                <div class="flex items-cent font-bold my-3">
                    <p>FormattedError</p>
                    <p class="mx-2">-</p>
                    <p>Original Error</p>
                </div>
                <div :key="formattedError" v-for="(formattedError, OriginalError) in errors" class="flex items-center">
                    <p class="flex-none">{{parseMetamaskError(OriginalError)}}</p>
                    <p class="mx-2">-</p>
                    <p>{{OriginalError}}</p>
                </div>
            </div>`,
}));

import { storiesOf } from '@storybook/vue';
import WhatIsMakerProtocol from './WhatIsMakerProtocol';

const common = {
    components: { WhatIsMakerProtocol },
};

storiesOf('WhatIsMakerProtocol', module).add('Default', () => ({
    ...common,
    template: '<WhatIsMakerProtocol />',
}));

import { storiesOf } from '@storybook/vue';
import WhatIsMakerProtocol from './WhatIsMakerProtocol';

const common = {
    components: { WhatIsMakerProtocol },
};

storiesOf('Common/Other/WhatIsMakerProtocol', module).add('Default', () => ({
    ...common,
    template: '<WhatIsMakerProtocol />',
}));

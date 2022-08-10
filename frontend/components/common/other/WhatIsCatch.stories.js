import { storiesOf } from '@storybook/vue';
import WhatIsCatch from './WhatIsCatch';

const common = {
    components: { WhatIsCatch },
};

storiesOf('Common/Other/WhatIsCatch', module).add('Default', () => ({
    ...common,
    template: '<WhatIsCatch />',
}));

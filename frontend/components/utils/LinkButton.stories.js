import { storiesOf } from '@storybook/vue';
import LinkButton from './LinkButton.vue';

storiesOf('Utils/LinkButton', module)
    .add('Primary', () => ({
        components: { LinkButton },
        template: `<LinkButton link="/" type="primary">I am a button!</LinkButton>`,
    }))
    .add('Secondary', () => ({
        components: { LinkButton },
        template: '<LinkButton link="/" type="secondary">I am a button!</LinkButton>',
    }));

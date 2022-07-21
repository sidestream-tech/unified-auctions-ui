import { storiesOf } from '@storybook/vue';
import Loading from './Loading';

storiesOf('Common/Other/Loading', module)
    .add('Without Loading', () => ({
        components: { Loading },
        template: `<Loading><div class="w-full h-screen border-black border-4">sample div</div></Loading>`,
    }))
    .add('Loading', () => ({
        components: { Loading },
        template: `<Loading is-loading><div class="w-full h-screen border-black border-4">sample div</div></Loading>`,
    }))
    .add('Error', () => ({
        components: { Loading },
        template: `<Loading error="This is an error message."><div class="w-full h-screen border-black border-4">sample div</div></Loading>`,
    }));

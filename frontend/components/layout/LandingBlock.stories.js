import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import LandingBlock from './LandingBlock.vue';

storiesOf('Layout/LandingBlock', module)
    .add('Default', () => ({
        components: { LandingBlock },
        methods: {
            explanations: action('explanations'),
        },
        template: `<div class="h-screen">
                        <div class="h-1/2">
                            <LandingBlock @explanations="explanations"></LandingBlock>
                        </div>
                    </div>`,
    }))
    .add('Custom Header Text', () => ({
        components: { LandingBlock },
        template: `<div class="h-screen">
                        <div class="h-1/2">
                            <LandingBlock>Maker Protocol <br /> Unified Auctions</LandingBlock>
                        </div>
                    </div>`,
    }));

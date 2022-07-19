import { storiesOf } from '@storybook/vue';
import AuctionTool from './AuctionTool.vue';

storiesOf('Common/Other/AuctionTool', module)
    .add('All Buttons', () => ({
        components: { AuctionTool },
        template: `<AuctionTool title="Swap liquidations" participateUrl="/" sourceUrl="/" dashboardUrl="/">Web tool which supports participation in the vault liquidations without the need for the liquidity.</AuctionTool>`,
    }))
    .add('Expert Mode', () => ({
        components: { AuctionTool },
        template:
            '<AuctionTool title="Liquidations platform" participateUrl="/" sourceUrl="/" :is-explanations-shown="false">Some explanation text that will be invisible.</AuctionTool>',
    }));

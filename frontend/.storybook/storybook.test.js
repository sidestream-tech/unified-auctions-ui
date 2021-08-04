import path from 'path';
import glob from 'glob';
import { mount } from '@vue/test-utils';
import { getStorybook } from '@storybook/vue';
import addons, { mockChannel } from '@storybook/addons';
import './preview';

describe('Storybook', () => {
    // find all storybook files
    const storyPaths = glob.sync('!(node_modules)/**/*.stories.js');

    // set addons channel
    // https://storybook.js.org/docs/react/workflows/faq#why-is-there-no-addons-channel
    addons.setChannel(mockChannel());

    // execute all story files
    storyPaths.map(storyPath => require(path.resolve(storyPath)));

    // get all storybook pages
    const pages = getStorybook();

    // iterate over pages
    for (const page of pages) {
        describe(`page "${page.kind}"`, () => {
            // iterate over stories
            for (const story of page.stories) {
                describe(`story "${story.name}"`, () => {
                    // test each story
                    it(`should not throw any error`, () => {
                        // mock console.error
                        jest.spyOn(global.console, 'error');

                        // mount story
                        mount(story.render());

                        // check that no errors occurred
                        expect(console.error).not.toHaveBeenCalled();
                    });
                });
            }
        });
    }
});

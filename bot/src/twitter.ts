import { TwitterApi, TwitterApiV2Settings } from 'twitter-api-v2';
import type { TwitterApiTokens } from 'twitter-api-v2';
import { isDev, enforceEnvVariables } from './utils';

TwitterApiV2Settings.debug = isDev;
let twitterClient: TwitterApi | undefined;

export const setupTwitter = function (): void {
    if (isDev) {
        console.warn('twitter: skipping twitter setup due to the dev mode');
        return;
    }
    try {
        enforceEnvVariables([
            'TWITTER_API_KEY',
            'TWITTER_API_SECRET',
            'TWITTER_ACCESS_TOKEN',
            'TWITTER_ACCESS_SECRET',
        ]);
    } catch {
        console.warn('twitter: twitter keys are missing');
        return;
    }
    twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    } as TwitterApiTokens);
};

export const sendNotification = async function (message: string) {
    if (isDev) {
        console.warn(`twitter: tweet is skipped due to the dev mode: "${message}"`);
        return;
    }
    if (!twitterClient) {
        console.error('twitter: twitter client was not yet initialised');
        return;
    }
    try {
        const result = await twitterClient.v2.tweet(message);
        console.info(`twitter: https://twitter.com/anyuser/status/${result.data.id}`);
    } catch (error) {
        console.error('twitter: tweeting failed:', error);
    }
};

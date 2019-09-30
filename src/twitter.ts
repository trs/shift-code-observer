import {TimelineStream, Tweet} from 'scrape-twitter';
import {passthrough, from, PureStream} from 'pure-stream';

const tweetStream = passthrough<Tweet>();

const tweetStreamOptions = {
  retweets: true,
  replies: false
};

[
  new TimelineStream('ShiftCodesTK', tweetStreamOptions),
  // new TimelineStream('dgShiftCodes', tweetStreamOptions)
].forEach((stream) => {
  PureStream.wrap(stream).pipe(tweetStream);
});

export default tweetStream;

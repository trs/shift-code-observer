import tweetStream from './twitter';
import {grabTweetText, grabShiftCodes} from './codes';

tweetStream
  .pipe(grabTweetText())
  .pipe(grabShiftCodes())
  .each((code) => {
    console.log('=============================');
    console.log(JSON.stringify(code, null, 2));
    console.log('=============================');
  })
  .done((err) => {
    console.log('done', err);
  });

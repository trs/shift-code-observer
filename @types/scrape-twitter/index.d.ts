declare module 'scrape-twitter' {
  import { Readable } from "stream";

  interface TimelineStreamConstructorParameters {
    retweets: boolean;
    replies: boolean;
    count?: number;
  }
  export class TimelineStream extends Readable {
    constructor(username: string, args: TimelineStreamConstructorParameters)
  }

  interface Quote {
    screenName: string;
    id: string;
    text: string;
  }

  export interface Tweet {
    screenName: string;
    id: string;
    time: string;
    text: string;
    quote?: Quote;
  }
}

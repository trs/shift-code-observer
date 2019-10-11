declare module 'rss-feed-emitter' {
  import {EventEmitter} from 'events';

  interface Feed {
    url: string;
    refresh: number;
  }

  class RssFeedEmitter extends EventEmitter {
    public add(feed: Feed): void;
    public destroy(): void;
  }
  export = RssFeedEmitter;
}

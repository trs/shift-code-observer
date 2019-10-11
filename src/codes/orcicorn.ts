import { Observable } from "rxjs";
import RssFeedEmitter from 'rss-feed-emitter';

import { ShiftCode } from "../types";

const RSS_URL = 'https://shift.orcicorn.com/shift-code/index.xml';

const REFRESH_INTERVAL = 60 * 1000;

const extract = (regex: RegExp) => (str: string) => {
  const match = regex.exec(str);
  if (!match) return undefined;
  return match[1];
}

const extractReward = extract(/Reward: (.+?)<br/);

const extractGame = extract(/Game: (.+?)<br/);

const extractPlatform = extract(/Platform: (.+?)<br/);

const extractExpiry = extract(/Expires: (.+?)<br/);

/**
 * Observe 10 newest codes from RSS feed
 */
export function observe(): Observable<ShiftCode> {
  return new Observable<ShiftCode>((sub) => {
    const feeder = new RssFeedEmitter();
    feeder.add({
      url: RSS_URL,
      refresh: REFRESH_INTERVAL
    });
    feeder.on('new-item', (item: any) => {
      const expiryDate = extractExpiry(item.description);
      const platform = extractPlatform(item.description);

      const shiftCode: ShiftCode = {
        code: item.title,
        created: item.date,
        expired: expiryDate ? new Date(expiryDate) : undefined,
        reward: extractReward(item.description),
        game: extractGame(item.description),
        platform: platform ? platform.toLocaleLowerCase() : undefined
      };
      sub.next(shiftCode);
    });

    return () => {
      feeder.destroy();
    };
  });
}

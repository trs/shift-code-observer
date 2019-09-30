import { transform, map } from "pure-stream";
import { Tweet } from "scrape-twitter";
import { GAMES, SHIFT_CODE, PLATFORMS } from "./const";

export interface ShiftCode {
  code: string;
  platform?: string;
  game?: string;
  reward?: string;
  expiry?: string;
}

export function grabTweetText() {
  return map<Tweet, string>((value) => {
    let text = value.text;
    if (value.quote) {
      text += '\n' + value.quote.text;
    }
    return text;
  });
}

export function parseExpiry(text: string) {
  const expiryMatch = /expires: (\d+)\/(\d+)/mi.exec(text);
  if (expiryMatch) {
    const year = new Date().getFullYear();
    const [month, day] = expiryMatch.slice(1, 3).map((v) => parseInt(v));
    return new Date(year, month - 1, day).toISOString();
  }

  const naMatch = /expires: N\/A*?/mi.exec(text);
  if (naMatch) {
    return 'Never';
  }
  return undefined;
}

export function parseReward(text: string) {
  const rewardMatch = /reward: (.+)/mi.exec(text);
  if (!rewardMatch) return undefined;
  return rewardMatch[1];
}

export function parseGame(text: string) {
  for (const [key, values] of Object.entries(GAMES)) {
    const found = values.find((value) => new RegExp(value, 'gmi').test(text));
    if (found) return key;
  }
  return undefined;
}

export function parsePlatform(text: string) {
  for (const [key, values] of Object.entries(PLATFORMS)) {
    const found = values.find((value) => new RegExp(value, 'gmi').test(text));
    if (found) return key;
  }
  return undefined;
}

export function parseCodes(text: string) {
  const codes = [];

  let codeMatch;
  while (true) {
    codeMatch = SHIFT_CODE.exec(text);
    if (!codeMatch) break;
    let platform = parsePlatform(codeMatch[1]);
    if (!platform) {
      // If it didn't find the platform on the same line
      // It may be for one platform somewhere else in the tweet
      platform = parsePlatform(text);
    }
    const code = codeMatch[2];

    codes.push({
      platform,
      code
    });
  }
  return codes;
}

export function grabShiftCodes() {
  return transform<string, any>((text, push) => {
    const game = parseGame(text);
    const expiry = parseExpiry(text);
    const reward = parseReward(text);
    const codes = parseCodes(text);
    for (const {platform, code} of codes) {

      if (!platform) {
        push({text})
      }

      // push({
      //   code,
      //   expiry,
      //   reward,
      //   platform,
      //   game
      // });
    }

  });
}

import fetch from 'node-fetch';
import {URL} from 'url';
import { Observable, from } from 'rxjs';
import { mergeMap, mergeAll } from 'rxjs/operators';

import { ShiftCode } from '../types';

const CODE_URL = 'https://shiftcodes.tk/assets/php/scripts/shift/retrieveCodes.php';

const REFRESH_INTERVAL = 60 * 1000;

const GAME_ID = [1, 2, 3, 4];

const PLATFORM_MAP = [
  'steam',
  'xbox',
  'playstation',
];

const GAME_MAP = [
  '',
  'Borderlands',
  'Borderlands 2',
  'Borderlands Pre-Sequel',
  'Borderlands 3'
];

interface APIResponse {
  codeID: string;
  relDate: string;
  expDate: string;
  reward: string;
  source: string;
  notes: string;

  platformsPC?: string;
  codePC?: string;
  platformsXbox?: string;
  codeXbox?: string;
  platformsPS?: string;
  codePS?: string;
}

function mapResponseToShiftCodes(game: number, response: APIResponse): ShiftCode[] {
  return ['PC', 'Xbox', 'PS']
    .filter((platform) => Object.keys(response).includes(`code${platform}`))
    .map((platform, i) => {
      const code: ShiftCode = {
        game: GAME_MAP[game],
        platform: PLATFORM_MAP[i],
        code: (response as any)[`code${platform}`],
        created: new Date(response.relDate),
        expired: new Date(response.expDate),
        reward: response.reward
      };
      return code;
    });
}

async function fetchGameCodes(game: number): Promise<ShiftCode[]> {
  try {
    const url = new URL(CODE_URL);
    url.searchParams.set('gameID', game.toString());

    const response = await fetch(url.href);
    const json = await response.json();
    const data = json.response as APIResponse[];
    return data.flatMap((value) => mapResponseToShiftCodes(game, value));
  } catch (err) {
    if (err.code === 'ETIMEDOUT') return [];
    else throw err;
  }
}

/**
 * Observe code endpoint every REFRESH_INTERVAL
 */
export function observe(): Observable<ShiftCode> {
  return new Observable<number>((sub) => {
    const writeGameIDs = () => GAME_ID.forEach((value) => sub.next(value));

    writeGameIDs();
    const timeout = setInterval(() => writeGameIDs(), REFRESH_INTERVAL);

    return () => clearInterval(timeout);
  })
    .pipe(
      mergeMap((game) => from(fetchGameCodes(game))),
      mergeAll()
    );
}

import { merge, of } from 'rxjs';
import { filter } from 'rxjs/operators';

import { getCurrent, getHistoric } from './codes';
import { ShiftCode } from './types';

export interface Options {
  game?: string;
  games?: string[];
  platform?: string;
  platforms?: string[];
  current?: boolean;
  historic?: boolean;
}

function resolveOptions(options: Options) {
  if (options.current === undefined) {
    options.current = true;
  }

  if (options.historic === undefined) {
    options.historic = true;
  }

  if (options.game) {
    options.games = [...new Set([
      ...(options.games || []),
      options.game
    ])];
  }
  if (options.games) {
    options.games = options.games.map((value) => value.toLocaleLowerCase());
  }

  if (options.platform) {
    options.platforms = [...new Set([
      ...(options.platforms || []),
      options.platform
    ])];
  }
  if (options.platforms) {
    options.platforms = options.platforms.map((value) => value.toLocaleLowerCase());
  }

  return options;
}

export function observeShiftCodes(options: Options = {}) {
  options = resolveOptions(options);

  return merge(
    options.current ? getCurrent() : of<ShiftCode>(),
    options.historic ? getHistoric() : of<ShiftCode>()
  )
    .pipe(
      filter((value) => !value.game || !options.games || options.games.includes(value.game)),
      filter((value) => !value.platform || !options.platforms || options.platforms.includes(value.platform))
    );
}

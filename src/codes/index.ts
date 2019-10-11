import { merge } from 'rxjs';
import { distinct } from 'rxjs/operators';

import { ShiftCode } from '../types';

import {observe as orcicorn} from './orcicorn';
import {observe as tk} from './tk';

import {observe as orcicornHistoric} from './orcicorn-historic';

function distinctShiftCodes() {
  return distinct<ShiftCode, string>((code) => code.code);
}

export function getHistoric() {
  return merge(
    orcicornHistoric()
  )
    .pipe(distinctShiftCodes());
}

export function getCurrent() {
  return merge(
    orcicorn(),
    tk()
  );
}

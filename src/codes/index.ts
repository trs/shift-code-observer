import { concat } from 'rxjs';
import { distinct } from 'rxjs/operators';

import { ShiftCode } from '../types';
import {observe as orcicornHistoric} from './orcicorn-historic';
import {observe as orcicorn} from './orcicorn';
import {observe as tk} from './tk';

function distinctShiftCodes() {
  return distinct<ShiftCode, string>((code) => code.code);
}

export function getShiftCodes() {
  return concat(
    orcicornHistoric(),
    orcicorn(),
    tk()
  )
    .pipe(distinct(distinctShiftCodes));
}

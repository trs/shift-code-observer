# Shift Code Observer

> Observe Borderlands SHiFT codes when they are released

## Install

```
npm install shift-code-observer
```

## Usage

### `observeShiftCodes(options? Options): Observable<ShiftCode>`

Create an [observable](https://rxjs-dev.firebaseapp.com/guide/observable) of SHiFT codes from various providers.

```ts

import {observeShiftCodes} from 'shift-code-observer';

observeShiftCodes()
.subscribe(
  (code) => console.log(code),
  (error) => console.error(error),
  () => console.log('Done');
);

```

#### `Options`

- `historic: boolean` (Default: `true`)
    - If true, will fetch codes previously released.

- `current: boolean` (Default: `true`)
    - If true, will fetch newly released codes.

- `game: string` / `games: string[]` (Default: `undefined`)
    - If set, will only fetch codes matching the provided game(s).

- `platform: string` / `platforms: string[]` (Default: `undefined`)
    - IF set, will only fetch codes matching the provided platforms(s).

## SHiFT Codes

Codes will be historic (previously released) and brand new as they are released.

## Sources

- https://shift.orcicorn.com/shift/
- https://shiftcodes.tk/

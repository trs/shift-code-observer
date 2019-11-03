import fetch from 'node-fetch';
import { URL } from 'url';
import cheerio from 'cheerio';
import { Observable, from, concat, timer } from "rxjs";
import { mergeAll, switchMap, distinct, concatMap } from "rxjs/operators";

import { ShiftCode } from "./types";

const MAIN_URL = 'https://shift.orcicorn.com/shift-code';
const POLL_INTERVAL = 60 * 1000;

async function getPageNumbers() {
  const response = await fetch(MAIN_URL);
  const text = await response.text();
  const $ = cheerio.load(text);

  const lastPage = $('.pagination .page-item:last-child .page-link a').text();

  return new Array(parseInt(lastPage)).fill(0).map((_, i) => ++i).reverse();
}

async function fetchCode(href: string): Promise<ShiftCode> {
  const url = new URL(href, MAIN_URL);
  const response = await fetch(url.href);
  const text = await response.text();
  const $ = cheerio.load(text);

  const getTableCell = (row: number, column = 2) => {
    return $(`.post-content table tr:nth-child(${row}) td:nth-child(${column})`);
  }

  const createdDate = getTableCell(6).text();
  let expiredDate = getTableCell(7).text();
  if (expiredDate.toLocaleLowerCase() === 'unknown') {
    expiredDate = '';
  }

  const code: ShiftCode = {
    code: $(getTableCell(2)).children('.code').text(),
    reward: getTableCell(3).text(),
    game: getTableCell(4).text(),
    platform: getTableCell(5).text().toLocaleLowerCase(),
    created: createdDate ? new Date(createdDate) : undefined,
    expired: expiredDate ? new Date(expiredDate) : undefined
  };
  return code;
}

async function fetchPage(page: number) {
  const path = page === 1 ? '' : `page/${page}`;

  const url = `${MAIN_URL}/${path}`;
  const response = await fetch(url);
  const text = await response.text();
  const $ = cheerio.load(text);

  const codes: Promise<ShiftCode>[] = [];
  $('.archive-item-link').each((i, element) => {
    const href = $(element).attr('href');
    const code = fetchCode(href);
    codes.push(code);
  });

  return await Promise.all(codes);
}

function observePage(page: number) {
  return from(fetchPage(page))
    .pipe(mergeAll());
}

/**
 * Fetch all shift codes, completed after all are observed
 */
export function getShiftCodes() {
  return from(getPageNumbers())
    .pipe(
      mergeAll(),
      concatMap((page) => observePage(page)),
      distinct(({code}) => code)
    );
}

/**
 * Fetch all shift codes, poll for newly released codes
 */
export function pollShiftCodes() {
  return concat(
    getShiftCodes(),
    timer(0, POLL_INTERVAL)
      .pipe(
        concatMap(() => observePage(1)),
        distinct(({code}) => code)
      )
  );
}

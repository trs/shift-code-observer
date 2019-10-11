import fetch from 'node-fetch';
import { URL } from 'url';
import cheerio from 'cheerio';
import { Observable, from } from "rxjs";
import { mergeAll, mergeMap } from "rxjs/operators";

import { ShiftCode } from "../types";

const MAIN_URL = 'https://shift.orcicorn.com/shift-code';

async function getPageNumbers() {
  const response = await fetch(MAIN_URL);
  const text = await response.text();
  const $ = cheerio.load(text);

  const lastPage = $('.pagination .page-item:last-child .page-link a').text();

  return new Array(parseInt(lastPage)).fill(0).map((_, i) => ++i);
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

/**
 * One time look up of all pages
 */
export function observe(): Observable<ShiftCode> {
  return from(getPageNumbers())
    .pipe(
      mergeAll(),
      mergeMap((page) => from(fetchPage(page))),
      mergeAll()
    );
}

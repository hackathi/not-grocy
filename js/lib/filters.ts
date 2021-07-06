import { DateTime as LuxonDateTime } from 'luxon';


export const LUXON_DATE_BEFORE = 'LUXON_DATE_BEFORE';
export const LUXON_DATE_BEFORE_OR_EQUAL = 'LUXON_DATE_BEFORE_OR_EQUAL';
export const LUXON_DATE_AFTER = 'LUXON_DATE_AFTER';
export const LUXON_DATE_AFTER_OR_EQUAL = 'LUXON_DATE_AFTER_OR_EQUAL';
export const LUXON_DATE_EQUAL = 'LUXON_DATE_EQUAL';
export const LUXON_DATE_NOT_EQUAL = 'LUXON_DATE_NOT_EQUAL';
export const LUXON_DATE_EQUAL_DAY = 'LUXON_DATE_EQUAL_DAY';
export const LUXON_DATE_NOT_EQUAL_DAY = 'LUXON_DATE_NOT_EQUAL_DAY';

function getValues(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null)
{
	
	let realValue = 0;
	if (typeof value === "string")
		realValue = LuxonDateTime.fromISO(value).toMillis();
	else if (value instanceof Date)
		realValue = LuxonDateTime.fromISO(value.toDateString()).toMillis();
	else if (value instanceof LuxonDateTime)
		realValue = value.toMillis();

	let realFilter = 0;

	if (typeof filter === "string")
		realFilter = LuxonDateTime.fromISO(filter).toMillis();
	else if (filter instanceof Date)
		realFilter = LuxonDateTime.fromISO(filter.toISOString()).toMillis();
	else if (typeof filter == "number")
		realFilter = LuxonDateTime.fromMillis(filter).toMillis();
	else if (filter instanceof LuxonDateTime)
		realFilter = filter.toMillis();
	
	return { realValue, realFilter };
}

function doFilter(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null, func: (a0: number, a1: number) => boolean): boolean
{
	if (value === undefined || value === null) return false;
	if (filter === undefined || filter === null) return true;

	if (typeof filter === "string" && filter.trim() == "") return false;

	const { realFilter, realValue } = getValues(value, filter);

	return func(realFilter, realValue);
}

export const luxonDateBeforeFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => a > b);
export const luxonDateBeforeOrEqualFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => a >= b);

export const luxonDateAfterFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => a < b);
export const luxonDateAfterOrEqualFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => a <= b);

export const luxonDateEqualFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => a == b);
export const luxonDateNotEqualFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => a != b);

export const luxonDateEqualDayFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => LuxonDateTime.fromMillis(a).startOf('day').toMillis() == LuxonDateTime.fromMillis(b).startOf('day').toMillis());
export const luxonDateNotEqualDayFilter =
	(value: LuxonDateTime | Date | string | undefined | null, filter: LuxonDateTime | Date | number | string | undefined | null): boolean =>
		doFilter(value, filter, (a, b) => LuxonDateTime.fromMillis(a).startOf('day').toMillis() != LuxonDateTime.fromMillis(b).startOf('day').toMillis());
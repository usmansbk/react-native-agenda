import {DayFormats} from '~types';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';

export const ITEM_HEIGHT = 40;

export const DAY_FORMATS: DayFormats = {
  sameDay: '[Today], dddd, D MMMM',
  nextDay: '[Tomorrow], dddd, D MMMM',
  nextWeek: 'dddd, D MMMM',
  lastDay: '[Yesterday], dddd, D MMMM',
  lastWeek: 'dddd, D MMMM',
  sameElse: 'dddd, D MMMM, YYYY',
};

export const MAX_NUMBER_OF_DAYS_PER_BATCH = 14;
export const COMMON_NUMBER_OF_DAYS_OFFSET = 7;

import {Frequency, Weekday} from 'rrule';

interface Recurrence {
  freq: Frequency;
  until?: string;
  count?: number | null;
  interval?: number;
  bySetPos?: number | number[];
  byMonth?: number | number[];
  byMonthDay?: number | number[];
  byYearDay?: number | number[];
  byWeekNumber?: number | number[];
  byWeekday?: number | number[] | Weekday | Weekday[];
}

export interface AgendaItem {
  id: string;
  title: string;
  startDate: string;
  startTime?: string;
  recurring?: Recurrence;
}

export type Section = string | AgendaItem;

export interface AgendaSection {
  title: string;
  data: AgendaItem[];
}

export interface DayFormats {
  sameDay: string;
  nextDay: string;
  nextWeek: string;
  lastDay: string;
  lastWeek: string;
  sameElse: string;
}

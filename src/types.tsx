import {Frequency} from 'rrule';

interface Recurrence {
  freq: Frequency;
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

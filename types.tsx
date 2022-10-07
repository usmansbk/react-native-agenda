import {Frequency} from 'rrule';

interface Recurrence {
  freq: Frequency;
}

export interface AgendaItem {
  id: string;
  title: string;
  startDate: string;
  startTime?: string;
  endTime?: string;
  recurring?: Recurrence;
}

export interface AgendaSection {
  title: string;
  data: AgendaItem[];
}

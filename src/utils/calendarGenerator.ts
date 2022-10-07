import {Frequency, RRule, RRuleSet} from 'rrule';
import {AgendaItem} from 'types';
import {DATE_FORMAT} from '~constants';
import dayjs from '~utils/dayjs';

export interface CalendarSection<T = Event> {
  title: string;
  data: T[];
}

export const getRecurringText = ({
  startDate,
  recurring,
}: AgendaItem): string | void => {
  if (!recurring) {
    return undefined;
  }

  return new RRule({
    freq: recurring?.freq,
    dtstart: dayjs.utc(startDate, DATE_FORMAT).toDate(),
  }).toText();
};

export function getEventDate(event: AgendaItem, after?: string) {
  const {startDate, recurring} = event;

  let eventDate = startDate;

  if (recurring?.freq) {
    const rule = new RRule({
      dtstart: dayjs.utc(startDate, DATE_FORMAT).toDate(),
      freq: recurring?.freq,
      wkst: RRule.SU,
    });

    const afterDate = dayjs.utc(after).startOf('day').toDate();
    const nextDate = rule.after(afterDate, true);

    if (nextDate) {
      eventDate = dayjs.utc(nextDate).format(DATE_FORMAT);
    }
  }

  return eventDate;
}

function matches<T extends AgendaItem>(event: T, date: dayjs.Dayjs): boolean {
  const {startDate, recurring} = event;

  let eventDate = dayjs.utc(startDate, DATE_FORMAT).toDate();
  if (recurring) {
    const {freq} = recurring;
    const rule = new RRule({
      dtstart: eventDate,
      freq: recurring?.freq,
      wkst: RRule.SU,
    });

    const nextDate = rule.after(date.toDate(), true);

    if (nextDate) {
      eventDate = nextDate;
    }
  }

  return date.isSame(eventDate, 'date');
}

function getDateEvents<T extends AgendaItem>(
  events: T[],
  date: dayjs.Dayjs,
): T[] {
  const data: T[] = [];

  events.forEach(event => {
    if (matches(event, date)) {
      data.push(event);
    }
  });

  return data.sort((a, b) => {
    if (a.startTime === b.startTime) {
      return 0;
    }

    if (!a.startTime) {
      return -1;
    }

    if (!b.startTime) {
      return 1;
    }

    if (a.startTime > b.startTime) {
      return 1;
    }

    return -1;
  });
}

function getNextScheduledDateRule(events: AgendaItem[]) {
  const rules = new RRuleSet();

  events.forEach(event => {
    const {startDate, recurring} = event;
    const eventDate = dayjs.utc(startDate, DATE_FORMAT).toDate();
    if (recurring) {
      rules.rrule(
        new RRule({
          dtstart: eventDate,
          freq: recurring?.freq,
          wkst: RRule.SU,
        }),
      );
    } else {
      rules.rrule(
        new RRule({
          dtstart: eventDate,
          freq: Frequency.DAILY,
          until: eventDate,
        }),
      );
    }
  });

  return rules;
}

type CalendarOptions = {
  events: AgendaItem[];
  selectedDate: dayjs.Dayjs;
  past?: boolean;
  skipEmptyDates?: boolean;
};

export function* calendarGenerator({
  events,
  selectedDate,
  past,
  skipEmptyDates = true,
}: CalendarOptions): Generator<CalendarSection, unknown, any> {
  let date: dayjs.Dayjs | undefined;
  let nextDates: RRuleSet | undefined;

  if (skipEmptyDates) {
    nextDates = getNextScheduledDateRule(events);
    const offsetDate = selectedDate.startOf('day').toDate();
    const nextDate = past
      ? nextDates?.before(offsetDate, true)
      : nextDates?.after(offsetDate, true);
    if (nextDate) {
      date = dayjs.utc(nextDate).startOf('day');
    }
  } else {
    date = selectedDate.startOf('day');
  }

  while (date) {
    yield {
      title: date.format(DATE_FORMAT),
      data: getDateEvents(events, date),
    };

    if (skipEmptyDates) {
      const nextDate = past
        ? nextDates?.before(date.toDate())
        : nextDates?.after(date.toDate());
      if (!nextDate) {
        break;
      }
      date = dayjs.utc(nextDate).startOf('day');
    } else {
      date = past ? date.subtract(1, 'day') : date.add(1, 'day');
    }
  }

  return undefined;
}

export function groupEventsByDate<T extends AgendaItem>(events: T[]) {
  const sections: CalendarSection<T>[] = [];
  const rules = new RRuleSet();

  events.forEach(({startDate}) => {
    const date = dayjs.utc(startDate, DATE_FORMAT).startOf('day').toDate();
    rules.rrule(
      new RRule({
        dtstart: date,
        freq: Frequency.DAILY,
        until: date,
      }),
    );
  });

  rules.all().forEach(startDate => {
    const date = dayjs.utc(startDate).startOf('day');
    sections.push({
      title: date.format(DATE_FORMAT),
      data: getDateEvents<T>(events, date),
    });
  });

  return sections;
}

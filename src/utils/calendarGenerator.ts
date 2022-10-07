import {Frequency, RRule, RRuleSet} from 'rrule';
import {AgendaItem} from 'types';
import {DATE_FORMAT} from '~constants';
import dayjs from '~utils/dayjs';

export interface CalendarSection<T = AgendaItem> {
  title: string;
  data: T[];
}

export function getItemDate<T extends AgendaItem>(item: T, after?: string) {
  const {startDate, recurring} = item;

  let date = startDate;

  if (recurring?.freq) {
    const rule = new RRule({
      dtstart: dayjs.utc(startDate, DATE_FORMAT).toDate(),
      freq: recurring?.freq,
      wkst: RRule.SU,
    });

    const afterDate = dayjs.utc(after).startOf('day').toDate();
    const nextDate = rule.after(afterDate, true);

    if (nextDate) {
      date = dayjs.utc(nextDate).format(DATE_FORMAT);
    }
  }

  return date;
}

function matches<T extends AgendaItem>(item: T, date: dayjs.Dayjs): boolean {
  const {startDate, recurring} = item;

  let eventDate = dayjs.utc(startDate, DATE_FORMAT).toDate();
  if (recurring) {
    const rule = new RRule({
      dtstart: eventDate,
      wkst: RRule.SU,
      freq: recurring.freq,
    });

    const nextDate = rule.after(date.toDate(), true);

    if (nextDate) {
      eventDate = nextDate;
    }
  }

  return date.isSame(eventDate, 'date');
}

function getItemsByDate<T extends AgendaItem>(
  items: T[],
  date: dayjs.Dayjs,
): T[] {
  const data: T[] = [];

  items.forEach(item => {
    if (matches(item, date)) {
      data.push(item);
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

function getItemsDateRules(events: AgendaItem[]) {
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
  items: AgendaItem[];
  selectedDate: dayjs.Dayjs;
  past?: boolean;
  skipEmptyDates?: boolean;
};

export function* calendarGenerator({
  items,
  selectedDate,
  past,
  skipEmptyDates = true,
}: CalendarOptions): Generator<CalendarSection, unknown, any> {
  let date: dayjs.Dayjs | undefined;
  let nextDates: RRuleSet | undefined;

  if (skipEmptyDates) {
    nextDates = getItemsDateRules(items);
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
      data: getItemsByDate(items, date),
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

export function groupItemsByDate<T extends AgendaItem>(items: T[]) {
  const groups: CalendarSection<T>[] = [];
  const rules = new RRuleSet();

  items.forEach(({startDate}) => {
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
    groups.push({
      title: date.format(DATE_FORMAT),
      data: getItemsByDate<T>(items, date),
    });
  });

  return groups;
}

import {Frequency, RRule, RRuleSet, Weekday} from 'rrule';
import {DATE_FORMAT} from '~constants';
import {AgendaItem, AgendaSection} from '~types';
import dayjs from '~utils/dayjs';

export function matches(item: AgendaItem, date: dayjs.Dayjs): boolean {
  const {startDate, recurring} = item;

  let itemDate = dayjs.utc(startDate, DATE_FORMAT).toDate();
  if (recurring) {
    const rule = new RRule({
      dtstart: itemDate,
      freq: recurring.freq,
    });

    const nextDate = rule.after(date.toDate(), true);

    if (nextDate) {
      itemDate = nextDate;
    }
  }

  return date.isSame(itemDate, 'date');
}

export function getItemsByDate(
  items: AgendaItem[],
  date: dayjs.Dayjs,
): AgendaItem[] {
  const data: AgendaItem[] = [];

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

type CreateDateRulesOptions = {
  initialDate?: dayjs.Dayjs;
  weekStart?: Weekday;
};

function createDateRules(
  events: AgendaItem[],
  {weekStart}: CreateDateRulesOptions,
) {
  const rules = new RRuleSet();
  const date = dayjs.utc().startOf('day').toDate();
  rules.rrule(
    new RRule({
      dtstart: date,
      freq: Frequency.DAILY,
      until: date,
    }),
  );

  events.forEach(event => {
    const {startDate, recurring} = event;
    const eventDate = dayjs.utc(startDate, DATE_FORMAT).toDate();
    if (recurring) {
      const {freq, until} = recurring;
      rules.rrule(
        new RRule({
          dtstart: eventDate,
          wkst: weekStart,
          freq,
          until: until ? dayjs.utc(until).endOf('day').toDate() : undefined,
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
  initialDate: dayjs.Dayjs;
  past?: boolean;
};

export function* calendarGenerator({
  items,
  initialDate,
  past,
  weekStart,
}: CalendarOptions & CreateDateRulesOptions): Generator<
  AgendaSection,
  AgendaSection | undefined,
  AgendaSection
> {
  const rules = createDateRules(items, {
    initialDate,
    weekStart,
  });

  if (!items.length) {
    return undefined;
  }

  const offsetDate = initialDate.startOf('day').toDate();
  const nextDate = past
    ? rules?.before(offsetDate, true)
    : rules?.after(offsetDate, true);

  let date: dayjs.Dayjs | undefined;
  if (nextDate) {
    date = dayjs.utc(nextDate).startOf('day');
  }

  while (date) {
    const title = date.format(DATE_FORMAT);
    const data = getItemsByDate(items, date);
    yield {
      title,
      data,
    };

    const nextDate = past
      ? rules?.before(date.toDate())
      : rules?.after(date.toDate());

    if (!nextDate) {
      date = past
        ? date.subtract(1, 'day').startOf('day')
        : date.add(1, 'day').startOf('day');
    } else {
      date = dayjs.utc(nextDate).startOf('day');
    }
  }

  return undefined;
}

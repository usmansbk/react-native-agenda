import {Frequency, RRule, RRuleSet} from 'rrule';
import {AgendaItem} from 'types';
import {DATE_FORMAT} from '~constants';
import dayjs from '~utils/dayjs';

export interface CalendarSection {
  title: string;
  data: AgendaItem[];
}

function matches(item: AgendaItem, date: dayjs.Dayjs): boolean {
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

function getItemsByDate(items: AgendaItem[], date: dayjs.Dayjs): AgendaItem[] {
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
};

export function* calendarGenerator({
  items,
  selectedDate,
  past,
}: CalendarOptions): Generator<CalendarSection, unknown, any> {
  let date: dayjs.Dayjs | undefined;
  let nextDates = getItemsDateRules(items);

  const offsetDate = selectedDate.startOf('day').toDate();

  const nextDate = past
    ? nextDates?.before(offsetDate, true)
    : nextDates?.after(offsetDate, true);

  if (nextDate) {
    date = dayjs.utc(nextDate).startOf('day');
  }

  while (date) {
    yield {
      title: date.format(DATE_FORMAT),
      data: getItemsByDate(items, date),
    };

    const nextDate = past
      ? nextDates?.before(date.toDate())
      : nextDates?.after(date.toDate());

    if (!nextDate) {
      break;
    }

    date = dayjs.utc(nextDate).startOf('day');
  }

  return undefined;
}

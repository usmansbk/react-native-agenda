import {Frequency, RRule, RRuleSet} from 'rrule';
import {AgendaItem, AgendaSection} from 'types';
import {DATE_FORMAT} from '~constants';
import dayjs from '~utils/dayjs';

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

function createDateRules(events: AgendaItem[]) {
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
}: CalendarOptions): Generator<AgendaSection, unknown, any> {
  const rules = createDateRules(items);
  const offsetDate = selectedDate.startOf('day').toDate();
  const nextDate = past
    ? rules?.before(offsetDate, true)
    : rules?.after(offsetDate, true);

  let date: dayjs.Dayjs | undefined;
  if (nextDate) {
    date = dayjs.utc(nextDate).startOf('day');
  }

  while (date) {
    yield {
      title: date.format(DATE_FORMAT),
      data: getItemsByDate(items, date),
    };

    const nextDate = past
      ? rules?.before(date.toDate())
      : rules?.after(date.toDate());

    if (!nextDate) {
      break;
    }

    date = dayjs.utc(nextDate).startOf('day');
  }

  return undefined;
}

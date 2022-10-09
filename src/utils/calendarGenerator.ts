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

type CreateDateRulesOptions = {
  showEmptyDays?: boolean;
  showInitialDay?: boolean;
  initialDate?: dayjs.Dayjs;
};

function createDateRules(
  events: AgendaItem[],
  {initialDate, showInitialDay, showEmptyDays}: CreateDateRulesOptions,
) {
  if (showEmptyDays && initialDate) {
    return new RRule({
      dtstart: initialDate.utc().startOf('day').toDate(),
      freq: Frequency.DAILY,
    });
  }

  const rules = new RRuleSet();
  if (showInitialDay && initialDate) {
    const date = initialDate.utc().startOf('day').toDate();
    rules.rrule(
      new RRule({
        dtstart: date,
        freq: Frequency.DAILY,
        until: date,
      }),
    );
  }

  events.forEach(event => {
    const {startDate, recurring} = event;
    const eventDate = dayjs.utc(startDate, DATE_FORMAT).toDate();
    if (recurring) {
      rules.rrule(
        new RRule({
          dtstart: eventDate,
          freq: recurring?.freq,
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
  showEmptyDays,
  showInitialDay,
}: CalendarOptions & CreateDateRulesOptions): Generator<
  AgendaSection,
  unknown,
  any
> {
  const rules = createDateRules(items, {
    showEmptyDays,
    initialDate,
    showInitialDay,
  });

  const offsetDate = initialDate.startOf('day').toDate();
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

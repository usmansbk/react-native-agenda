import {faker} from '@faker-js/faker';
import dayjs from 'dayjs';
import {AgendaItem} from 'types';
import {DATE_FORMAT, TIME_FORMAT} from '~constants';

export function generateItems(length = 10): AgendaItem[] {
  return Array.from({length}).map(() => ({
    id: faker.datatype.uuid(),
    title: faker.random.word(),
    startDate: dayjs(faker.date.future()).format(DATE_FORMAT),
    startTime: dayjs(faker.date.soon()).format(TIME_FORMAT),
    endTime: dayjs(faker.date.soon()).format(TIME_FORMAT),
  }));
}

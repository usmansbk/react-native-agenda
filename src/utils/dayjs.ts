import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(calendar);
dayjs.extend(isSameOrAfter);

export default dayjs;

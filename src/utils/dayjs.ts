import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(calendar);

export default dayjs;

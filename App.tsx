import React, {useState} from 'react';
import {AgendaItem} from 'types';
import {DATE_FORMAT} from '~constants';
import Agenda from '~index';
import dayjs from '~utils/dayjs';

function App() {
  const [events] = useState<AgendaItem[]>([
    {
      id: '1',
      title: 'Testing event',
      startDate: dayjs().format(DATE_FORMAT),
    },
  ]);

  console.log(events);

  return <Agenda items={events} />;
}

export default App;

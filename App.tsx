import React, {useState} from 'react';
import Agenda from './src';
import {AgendaEvent} from './types';
import dayjs from './src/utils/dayjs';
import {DATE_FORMAT} from './src/constants';

function App() {
  const [events] = useState<AgendaEvent[]>([
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

import React, {useState} from 'react';
import Agenda from '~index';
import {AgendaItem} from '~types';

function App() {
  const [events] = useState<AgendaItem[]>([
    {
      id: '1',
      title: 'Scholarships',
      startDate: '2022-10-09',
      startTime: '19:06',
      recurring: {
        freq: 1,
      },
    },
  ]);

  return <Agenda items={events} />;
}

export default App;

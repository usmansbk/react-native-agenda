import React, {useState} from 'react';
import {AgendaItem} from 'types';
import Agenda from '~index';
import {generateItems} from '~mockData';

function App() {
  const [events] = useState<AgendaItem[]>(generateItems());

  return <Agenda items={events} />;
}

export default App;

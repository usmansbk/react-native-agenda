import React, {useState} from 'react';
import Agenda from '~index';
import {generateItems} from '~mockData';
import {AgendaItem} from '~types';

function App() {
  const [events] = useState<AgendaItem[]>(generateItems());

  return <Agenda items={events} />;
}

export default App;

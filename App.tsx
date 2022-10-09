import React, {useState} from 'react';
import Agenda from '~index';
import {AgendaItem} from '~types';

function App() {
  const [events] = useState<AgendaItem[]>([]);

  return <Agenda items={events} />;
}

export default App;

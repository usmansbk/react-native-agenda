import React, {useState} from 'react';
import {SafeAreaView} from 'react-native';
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

  return (
    <SafeAreaView>
      <Agenda items={events} />
    </SafeAreaView>
  );
}

export default App;

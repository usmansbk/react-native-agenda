import React, {useState} from 'react';
import {SafeAreaView} from 'react-native';
import {AgendaList, Frequency} from '~index';
import {AgendaItem} from '~types';

function App() {
  const [events] = useState<AgendaItem[]>([
    {
      id: '1',
      title: 'Scholarships',
      startDate: '2022-01-10',
      startTime: '19:06',
      recurring: {
        freq: Frequency.YEARLY,
      },
    },
    {
      id: '2',
      title: 'Overdue',
      startDate: '2022-10-10',
      startTime: '23:06',
    },
  ]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <AgendaList items={events} />
    </SafeAreaView>
  );
}

export default App;

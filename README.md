# react-native-agenda (WIP: NOT PUBLISHED)

A React Native `Agenda` component that can display infinite repeating listings

The package is both **Android** and **iOS** compatible.

## Try it out

You can run example module by performing these steps:

```sh
git clone git@github.com:usmansbk/react-native-agenda.git
cd react-native-agenda
yarn
```

```sh
yarn android
# or
cd ios && pod install && cd ..
yarn ios
```

## Installation

```sh
yarn add react-native-agenda
```

## Usage

The component is built on top [@shopify/flash-list](https://shopify.github.io/flash-list/docs/). I suggest you read their docs for a better understanding of how to customize your Agenda list.

## Getting Started

```jsx
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native';
import Agenda, {Frequency, AgendaItem} from 'react-native-agenda';

export default function App() {
  const [events] = useState<AgendaItem[]>([
    {
      id: '1',
      title: 'Pick up laundry',
      startDate: '2022-01-10',
      startTime: '19:06',
      recurring: {
        freq: Frequency.DAILY,
      },
    },
    {
      id: '2',
      title: 'Do dishes',
      startDate: '2022-10-10',
      startTime: '23:06',
    },
  ]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <Agenda items={events} />
    </SafeAreaView>
  );
}
```

## Authors

- [Babakolo Usman Suleiman](https://github.com/usmansbk) - [@421_misdirected](https://twitter.com/421_misdirected)

## Contributing

Pull requests are most welcome! Don't forget to add a title and description that explain the issue you're trying to solve and your suggested solution. Screenshots and gifs are very helpful.

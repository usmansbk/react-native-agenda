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

The component is built on top [@shopify/flash-list](https://github.com/Shopify/flash-list/). We recommend reading the detailed documentation for using FlashList [here](https://shopify.github.io/flash-list/docs/).

## Getting Started

```tsx
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native';
import {AgendaItem, AgendaList, Frequency} from 'react-native-agenda';

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
      <AgendaList items={events} />
    </SafeAreaView>
  );
}
```

## API Documentation

### AgendaItem

```ts
export interface AgendaItem {
  id: string;
  title: string;
  startDate: string;
  startTime?: string;
  recurring?: Recurrence;
}
```

### AgendaList

```ts
export enum CalendarMode {
  UPCOMING,
  PAST,
}

export interface AgendaListProps {
  loadPastText?: string; // default: 'Load Past'
  loadUpcomingText?: string; // default: 'Load Upcoming'

  // The week start day. Must be one of the Weekday.MO, Weekday.TU, Weekday.WE constants, or an integer, specifying the first day of the week. This will affect recurrences based on weekly periods. The default week start is Weekday.MO
  weekStart?: Weekday;
  loading?: boolean;
  maxDaysPerBatch?: number; // default: 14 days
  animateScrollTo?: boolean; // default: false
  items: AgendaItem[];
  itemHeight?: number; // default: 40
  onPressItem?: (item: AgendaItem) => void;
  testID?: FlashListProps['testID'];
  contentContainerStyle?: FlashListProps['contentContainerStyle'];
  onScroll?: FlashListProps['onScroll'];
  showsVerticalScrollIndicator?: FlashListProps['showsVerticalScrollIndicator'];
  keyboardShouldPersistTaps?: FlashListProps['keyboardShouldPersistTaps'];
  onEndReachedThreshold?: FlashListProps['onEndReachedThreshold'];
  refreshControl?: FlashListProps['refreshControl'];
  onRefresh?: FlashListProps['onRefresh'];
  keyExtractor?: FlashListProps['keyExtractor'];
  renderHeader: (onPress: () => void, mode: CalendarMode) => React.ReactElement;
  renderDayHeader?: FlashListProps['renderItem'];
  renderItem?: FlashListProps['renderItem'];
  ItemSeparatorComponent?: FlashListProps['ItemSeparatorComponent'];
  ListEmptyComponent?: FlashListProps['ListEmptyComponent'];
  ListFooterComponent?: FlashListProps['ListFooterComponent'];
}
```

### Recurrence

Recurrence is handled with `RRule` [package](https://github.com/jakubroztocil/rrule). Check their [docs](https://github.com/jakubroztocil/rrule/blob/master/README.md#api) for more details.

```ts
interface Recurrence {
  freq: Frequency;
  until?: string;
  count?: number | null;
  interval?: number;
  bySetPos?: number | number[];
  byMonth?: number | number[];
  byMonthDay?: number | number[];
  byYearDay?: number | number[];
  byWeekNumber?: number | number[];
  byWeekday?: number | number[] | Weekday | Weekday[];
}
```

### Frequency

```ts
interface Frequency {
  DAILY;
  WEEKLY;
  MONTHLY;
  YEARLY;
}
```

## Authors

- [Babakolo Usman Suleiman](https://github.com/usmansbk) - [@421_misdirected](https://twitter.com/421_misdirected)

## Contributing

Pull requests are most welcome! Don't forget to add a title and description that explain the issue you're trying to solve and your suggested solution. Screenshots and gifs are very helpful.

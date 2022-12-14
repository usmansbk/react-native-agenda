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

We also use [`rrule.js`](https://github.com/jakubroztocil/rrule) and [`day.js`](https://day.js.org/en/) to manipulate recurring dates.

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
  startDate: string; // YYYY-MM-DD (UTC date string)
  startTime?: string; // HH:mm or hh:mm A
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
  loadPastText?: string; // default: 'View Past'
  loadUpcomingText?: string; // default: 'View Upcoming'

  // The week start day. Must be one of the Weekday.MO, Weekday.TU, Weekday.WE constants, or an integer,
  // specifying the first day of the week. This will affect recurrences based on weekly periods.
  // The default week start is Weekday.MO
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

We recommend reading the detailed `RRule` [documentation](https://github.com/jakubroztocil/rrule/blob/master/README.md#api).

```ts
interface Recurrence {
  freq: Frequency;

  // If given, this must be a Date instance, that will specify the limit of the recurrence.
  // If a recurrence instance happens to be the same as the Date instance given in the until argument,
  // this will be the last occurrence.
  until?: string;

  // How many occurrences will be generated.
  count?: number | null;

  // The interval between each freq iteration.
  // For example, when using Frequency.YEARLY, an interval of 2 means once every two years.
  // The default interval is 1.
  interval?: number;

  // If given, it must be either an integer, or an array of integers, positive or negative.
  // Each given integer will specify an occurrence number,
  // corresponding to the nth occurrence of the rule inside the frequency period.
  // For example, a bysetpos of -1 if combined with a Frequency.MONTHLY frequency,
  // and a byWeekday of (Weekday.MO, Weekday.TU, Weekday.WE, Weekday.TH, Weekday.FR),
  // will result in the last work day of every month.
  bySetPos?: number | number[];

  // If given, it must be either an integer, or an array of integers, meaning the months to apply the recurrence to.
  byMonth?: number | number[];

  // If given, it must be either an integer, or an array of integers, meaning the month days to apply the recurrence to.
  byMonthDay?: number | number[];

  // If given, it must be either an integer, or an array of integers, meaning the year days to apply the recurrence to.
  byYearDay?: number | number[];

  // If given, it must be either an integer, or an array of integers,
  // meaning the week numbers to apply the recurrence to.
  // Week numbers have the meaning described in ISO8601, that is,
  // the first week of the year is that containing at least four days of the new year.
  byWeekNumber?: number | number[];

  // If given, it must be either an integer (0 == Weekday.MO), an array of integers,
  // one of the weekday constants (Weekday.MO, Weekday.TU, etc), or an array of these constants.
  // When given, these variables will define the weekdays where the recurrence will be applied.
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

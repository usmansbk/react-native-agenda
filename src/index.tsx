import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AgendaItem} from 'types';
import DefaultAgendaItem from '~components/DefaultAgendaItem';

interface Props<T extends AgendaItem> {
  hideEmptyDates?: boolean;
  selectedDate?: string;
  items: T[];
  refreshing?: boolean;
  loadItemsForMonth?: (month: number) => void;
  renderItem?: (item: T) => React.ReactNode;
  renderEmptyDate?: () => React.ReactNode;
  renderEmptyData?: () => React.ReactNode;
  onRefresh?: () => void;
  onDayChange?: (day: number) => void;
  onDayPress?: (day: number) => void;
  keyExtractor?: (item: T, index: number) => string;
}

const renderDefaultItem = (item: AgendaItem) => (
  <DefaultAgendaItem item={item} key={item.id} />
);

export default function Agenda<T extends AgendaItem>({
  items,
  renderItem = renderDefaultItem,
}: Props<T>) {
  return <View style={styles.container}>{items.map(renderItem)}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

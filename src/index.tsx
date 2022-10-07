import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AgendaItem} from 'types';

interface Props {
  hideEmptyDates?: boolean;
  selectedDate?: string;
  minDate?: string;
  maxDate?: string;
  items: AgendaItem[];
  refreshing?: boolean;
  loadItemsForMonth?: (month: number) => void;
  renderItem?: () => React.ReactNode;
  renderEmptyDate?: () => React.ReactNode;
  renderEmptyData?: () => React.ReactNode;
  onRefresh?: () => void;
  onDayChange?: (day: number) => void;
  onDayPress?: (day: number) => void;
}

export default function Agenda({}: Props) {
  return (
    <View style={styles.container}>
      <Text>Agenda</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

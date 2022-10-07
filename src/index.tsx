import React from 'react';
import {Text, View} from 'react-native';
import {AgendaEvent} from '../types';

interface Props {
  hideEmptyDates?: boolean;
  selectedDate?: string;
  minDate?: string;
  maxDate?: string;
  items: AgendaEvent[];
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
    <View>
      <Text>Agenda</Text>
    </View>
  );
}

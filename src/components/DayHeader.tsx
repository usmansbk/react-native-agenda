import {StyleSheet, Text, View} from 'react-native';
import colors from '~config/colors';
import {ITEM_HEIGHT} from '~constants';
import dayjs from '~utils/dayjs';

interface Props {
  date: string;
}

export default function DayHeader({date}: Props) {
  const title = dayjs(date).calendar(null, {
    sameDay: '[Today,] dddd, D MMMM',
    nextDay: '[Tomorrow,], dddd, D MMMM',
    nextWeek: 'dddd, D MMMM',
    lastDay: '[Yesterday,] dddd, D MMMM',
    lastWeek: 'dddd, D MMMM',
    sameElse: 'dddd, D MMMM, YYYY',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title.toLocaleUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 12,
    color: colors.text,
  },
});

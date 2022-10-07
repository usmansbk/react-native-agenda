import {StyleSheet, Text, View} from 'react-native';
import {AgendaSection} from 'types';
import {ITEM_HEIGHT} from '~constants';
import dayjs from '~utils/dayjs';

interface Props {
  section: AgendaSection;
}

export default function DateHeader({section}: Props) {
  const {title} = section;

  const date = dayjs(title).calendar(null, {
    sameDay: '[Today,] dddd, D MMMM',
    nextDay: '[Tomorrow,], dddd, D MMMM',
    nextWeek: 'dddd, D MMMM',
    lastDay: '[Yesterday,] dddd, D MMMM',
    lastWeek: 'dddd, D MMMM',
    sameElse: 'dddd, D MMMM',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{date.toLocaleUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

import {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import colors from '~config/colors';
import {DAY_FORMATS, ITEM_HEIGHT} from '~constants';
import dayjs from '~utils/dayjs';

interface Props {
  date: string;
}

function DayHeader({date}: Props) {
  const title = dayjs(date).calendar(null, DAY_FORMATS);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title.toLocaleUpperCase()}</Text>
    </View>
  );
}

export default memo(DayHeader);

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

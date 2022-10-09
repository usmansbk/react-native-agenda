import {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import colors from '~config/colors';
import {ITEM_HEIGHT} from '~constants';

interface Props {
  title: string;
}

function DayHeader({title}: Props) {
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

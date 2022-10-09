import {memo, useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '~config/colors';
import {ITEM_HEIGHT} from '~constants';
import {AgendaItem} from '~types';

interface Props {
  item: AgendaItem;
  onPress?: (item: AgendaItem) => void;
}

function DefaultAgendaItem({item, onPress}: Props) {
  const {title, startTime} = item;

  const handlePress = useCallback(() => onPress?.(item), [item, onPress]);

  return (
    <TouchableOpacity onPress={onPress && handlePress}>
      <View style={styles.container}>
        <Text style={styles.time}>{startTime}</Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default memo(DefaultAgendaItem);

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    flexDirection: 'row',
  },
  title: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  time: {
    fontWeight: 'bold',
    color: colors.textDarker,
    fontSize: 12,
    width: 48,
  },
});

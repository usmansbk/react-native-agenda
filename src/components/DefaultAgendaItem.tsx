import {useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import colors from '~config/colors';
import {ITEM_HEIGHT} from '~constants';
import {AgendaItem} from '~types';

interface Props {
  item: AgendaItem;
  onPress?: (item: AgendaItem) => void;
}

export default function DefaultAgendaItem({item, onPress}: Props) {
  const {title, startTime} = item;

  const handlePress = useCallback(() => onPress?.(item), [item, onPress]);

  return (
    <TouchableOpacity onPress={onPress && handlePress}>
      <View style={styles.container}>
        <Text style={styles.time}>{startTime}</Text>
        <Text ellipsizeMode="tail" style={styles.title}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

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
  },
  time: {
    fontWeight: 'bold',
    color: colors.textDarker,
    fontSize: 12,
    width: 48,
  },
});

import {useCallback} from 'react';
import {StyleSheet, Text, TouchableNativeFeedback, View} from 'react-native';
import {AgendaItem} from 'types';
import {ITEM_HEIGHT} from '~constants';

interface Props {
  item: AgendaItem;
  onPress?: (item: AgendaItem) => void;
}

export default function DefaultAgendaItem({item, onPress}: Props) {
  const {title} = item;

  const _onPress = useCallback(() => onPress?.(item), [item, onPress]);

  return (
    <TouchableNativeFeedback onPress={_onPress}>
      <View style={styles.container}>
        <Text ellipsizeMode="tail" style={styles.title}>
          {title}
        </Text>
      </View>
    </TouchableNativeFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
  },
});

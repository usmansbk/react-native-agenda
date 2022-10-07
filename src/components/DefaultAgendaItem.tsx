import {StyleSheet, Text, View} from 'react-native';
import {AgendaItem} from 'types';
import {ITEM_HEIGHT} from '~constants';

interface Props {
  item: AgendaItem;
}

export default function DefaultAgendaItem({item}: Props) {
  const {title} = item;
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    margin: 4,
    borderRadius: 4,
    backgroundColor: 'white',
    elevation: 1,
  },
});

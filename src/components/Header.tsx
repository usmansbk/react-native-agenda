import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import colors from '~config/colors';
import {ITEM_HEIGHT} from '~constants';

interface Props {
  title?: string;
  onPress?: () => void;
}

export default function Header({title = 'Load more', onPress}: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
  },
});

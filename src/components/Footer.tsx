import {StyleSheet, View} from 'react-native';
import {ITEM_HEIGHT} from '~constants';

export default function Footer() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
  },
});

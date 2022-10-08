import {StyleSheet, Text, View} from 'react-native';
import colors from '~config/colors';
import {ITEM_HEIGHT} from '~constants';

export default function EmptyDate() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No events</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.text,
  },
});

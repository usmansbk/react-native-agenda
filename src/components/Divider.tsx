import {StyleSheet, View} from 'react-native';
import colors from '~config/colors';

export default function Divider() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    height: 1,
    backgroundColor: colors.divider,
  },
});

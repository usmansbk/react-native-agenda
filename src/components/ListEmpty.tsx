import {StyleSheet, Text, View} from 'react-native';
import colors from '~config/colors';

export default function ListEmpty() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No Events</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

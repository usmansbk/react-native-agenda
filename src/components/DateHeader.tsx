import {StyleSheet, Text, View} from 'react-native';
import {AgendaSection} from 'types';
import {ITEM_HEIGHT} from '~constants';

interface Props {
  section: AgendaSection;
}

export default function DateHeader({section}: Props) {
  const {title} = section;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title.toLocaleUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  title: {
    fontWeight: 'bold',
  },
});

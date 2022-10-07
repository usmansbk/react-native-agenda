import React, {useCallback, useState} from 'react';
import {SectionList, SectionListProps, StyleSheet} from 'react-native';
import {AgendaItem, AgendaSection} from 'types';
import DateHeader from '~components/DateHeader';
import DefaultAgendaItem from '~components/DefaultAgendaItem';
import Divider from '~components/Divider';
import ListEmpty from '~components/ListEmpty';
import {ITEM_HEIGHT} from '~constants';

type ListProps = Omit<SectionListProps<AgendaItem, AgendaSection>, 'sections'>;

interface Props extends ListProps {
  selectedDate?: string;
  items: AgendaItem[];
  onPressItem?: (item: AgendaItem) => void;
}

const getDefaultItemLayout: Props['getItemLayout'] = (_data, index) => ({
  length: ITEM_HEIGHT,
  offset: index * ITEM_HEIGHT,
  index,
});

const keyExtractor = (item: AgendaItem) => item.id;

export default function AgendaList({
  items,
  refreshing,
  onRefresh,
  refreshControl,
  onPressItem,
  renderItem,
  renderSectionHeader,
  initialNumToRender = 1,
  getItemLayout = getDefaultItemLayout,
  ItemSeparatorComponent = Divider,
  ListEmptyComponent = ListEmpty,
}: Props) {
  const [sections] = useState<AgendaSection[]>([
    {
      title: '2022-10-07',
      data: items,
    },
  ]);

  const _renderItem = useCallback(
    ({item}: {item: AgendaItem}) => (
      <DefaultAgendaItem item={item} onPress={onPressItem} />
    ),
    [onPressItem],
  );

  const _renderSectionHeader = useCallback(
    ({section}: {section: AgendaSection}) => <DateHeader section={section} />,
    [],
  );

  return (
    <SectionList
      refreshing={refreshing}
      onRefresh={onRefresh}
      refreshControl={refreshControl}
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      initialNumToRender={initialNumToRender}
      sections={sections}
      renderItem={renderItem || _renderItem}
      renderSectionHeader={renderSectionHeader || _renderSectionHeader}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.contentContainer}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
});

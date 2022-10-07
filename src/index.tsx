import React, {useState} from 'react';
import {
  SectionList,
  SectionListData,
  SectionListProps,
  SectionListRenderItem,
  StyleSheet,
} from 'react-native';
import {AgendaItem, AgendaSection} from 'types';
import DefaultAgendaItem from '~components/DefaultAgendaItem';
import Divider from '~components/Divider';
import ListEmpty from '~components/ListEmpty';
import {ITEM_HEIGHT} from '~constants';

interface Props<T extends AgendaItem = AgendaItem> {
  selectedDate?: string;
  items: T[];
  renderItem?: SectionListRenderItem<T, AgendaSection>;
  onRefresh?: () => void;
  getItemLayout?: (
    _data: SectionListData<AgendaItem, AgendaSection>[] | null,
    index: number,
  ) => {
    length: number;
    offset: number;
    index: number;
  };
  ItemSeperatorComponent?: SectionListProps<
    T,
    AgendaSection
  >['ItemSeparatorComponent'];
  ListEmptyComponent?: SectionListProps<T, AgendaSection>['ListEmptyComponent'];
}

const renderDefaultItem: Props['renderItem'] = ({item}) => (
  <DefaultAgendaItem item={item} />
);

const getDefaultItemLayout: Props['getItemLayout'] = (_data, index) => ({
  length: ITEM_HEIGHT,
  offset: index * ITEM_HEIGHT,
  index,
});

const keyExtractor = (item: AgendaItem) => item.id;

export default function Agenda<T extends AgendaItem>({
  items,
  renderItem = renderDefaultItem,
  ItemSeperatorComponent = Divider,
  ListEmptyComponent = ListEmpty,
}: Props) {
  const [sections] = useState<AgendaSection<T>[]>([]);

  return (
    <SectionList
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      sections={sections}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.contentContainer}
      getItemLayout={getDefaultItemLayout}
      ItemSeparatorComponent={ItemSeperatorComponent}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});

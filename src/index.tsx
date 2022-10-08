import dayjs from 'dayjs';
import React from 'react';
import {SectionList, SectionListProps, StyleSheet} from 'react-native';
import {AgendaItem, AgendaSection} from 'types';
import DateHeader from '~components/DateHeader';
import DefaultAgendaItem from '~components/DefaultAgendaItem';
import Divider from '~components/Divider';
import ListEmpty from '~components/ListEmpty';
import {ITEM_HEIGHT} from '~constants';
import {calendarGenerator} from '~utils/calendarGenerator';

interface Props
  extends Omit<SectionListProps<AgendaItem, AgendaSection>, 'sections'> {
  selectedDate?: string;
  items: AgendaItem[];
  onPressItem?: (item: AgendaItem) => void;
}

interface State {
  sections: AgendaSection[];
}

export default class AgendaList extends React.Component<Props, State> {
  state: Readonly<State> = {
    sections: [],
  };

  upcomingEvents = calendarGenerator({
    items: this.props.items,
    selectedDate: this.props.selectedDate
      ? dayjs(this.props.selectedDate)
      : dayjs(),
  });

  pastEvents = calendarGenerator({
    past: true,
    items: this.props.items,
    selectedDate: this.props.selectedDate
      ? dayjs(this.props.selectedDate)
      : dayjs(),
  });

  private keyExtractor: Props['keyExtractor'] = (item: AgendaItem) => item.id;

  private renderItem: Props['renderItem'] = ({item}) => (
    <DefaultAgendaItem item={item} onPress={this.props.onPressItem} />
  );

  private renderSectionHeader: Props['renderSectionHeader'] = ({section}) => (
    <DateHeader section={section} />
  );

  private getItemLayout: Props['getItemLayout'] = (_data, index) => ({
    length: ITEM_HEIGHT,
    offset: index * ITEM_HEIGHT,
    index,
  });

  private loadEvents = () => {
    let sections: AgendaSection[] = [];
    for (let i = 0; i < 100; i += 1) {
      const section = this.upcomingEvents.next();
      if (!section.done) {
        sections.push(section.value);
      }
    }
    if (sections.length) {
      this.setState(prev => ({
        sections: [...prev.sections, ...sections],
      }));
    }
  };

  componentDidMount = () => {
    this.loadEvents();
  };

  render(): React.ReactNode {
    const {
      renderItem,
      renderSectionHeader,
      getItemLayout,
      keyExtractor,
      initialNumToRender = 1,
      ItemSeparatorComponent = Divider,
      ListEmptyComponent = ListEmpty,
      ...rest
    } = this.props;

    return (
      <SectionList
        {...rest}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        initialNumToRender={initialNumToRender}
        sections={this.state.sections}
        renderItem={renderItem || this.renderItem}
        renderSectionHeader={renderSectionHeader || this.renderSectionHeader}
        keyExtractor={keyExtractor || this.keyExtractor}
        contentContainerStyle={styles.contentContainer}
        getItemLayout={getItemLayout || this.getItemLayout}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={ListEmptyComponent}
      />
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
});

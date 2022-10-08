import dayjs from 'dayjs';
import React, {createRef, RefObject} from 'react';
import {SectionList, SectionListProps, StyleSheet} from 'react-native';
import {AgendaItem, AgendaSection} from 'types';
import DateHeader from '~components/DateHeader';
import DefaultAgendaItem from '~components/DefaultAgendaItem';
import Divider from '~components/Divider';
import EmptyDate from '~components/EmptyDate';
import ListEmpty from '~components/ListEmpty';
import colors from '~config/colors';
import {DATE_FORMAT, ITEM_HEIGHT} from '~constants';
import {calendarGenerator} from '~utils/calendarGenerator';

type ListProps = SectionListProps<AgendaItem, AgendaSection>;

export interface AgendaListProps {
  loading?: boolean;
  selectedDate?: string;
  items: AgendaItem[];
  onPressItem?: (item: AgendaItem) => void;
  keyboardShouldPersistTaps?: ListProps['keyboardShouldPersistTaps'];
  onEndReachedThreshold?: ListProps['onEndReachedThreshold'];
  refreshControl?: ListProps['refreshControl'];
  onRefresh?: ListProps['onRefresh'];
  keyExtractor?: ListProps['keyExtractor'];
  renderDateHeader?: ListProps['renderSectionHeader'];
  renderItem?: ListProps['renderItem'];
  renderEmptyDate?: ListProps['renderSectionFooter'];
  getItemLayout?: ListProps['getItemLayout'];
  initialNumToRender?: ListProps['initialNumToRender'];
  ItemSeparatorComponent?: ListProps['ItemSeparatorComponent'];
  ListEmptyComponent?: ListProps['ListEmptyComponent'];
}

type Props = AgendaListProps;

interface State {
  sections: AgendaSection[];
  hasMoreUpcoming: boolean;
  hasMorePast: boolean;
}

export default class AgendaList extends React.PureComponent<Props, State> {
  state: Readonly<State> = {
    sections: [],
    hasMorePast: true,
    hasMoreUpcoming: true,
  };

  static defaultProps: Readonly<Partial<Props>> = {
    initialNumToRender: 1,
    ItemSeparatorComponent: Divider,
    ListEmptyComponent: ListEmpty,
  };

  private mountTimer: number | undefined;
  private loadMoreTimer: number | undefined;

  private ref: RefObject<SectionList<AgendaItem, AgendaSection>> = createRef();

  private getSelectedDate = () => {
    const date = this.props.selectedDate;
    return date ? dayjs(date) : dayjs();
  };

  private upcomingItems = calendarGenerator({
    items: this.props.items,
    selectedDate: this.getSelectedDate(),
  });

  private pastItems = calendarGenerator({
    past: true,
    items: this.props.items,
    selectedDate: this.getSelectedDate(),
  });

  private keyExtractor: Props['keyExtractor'] = (item: AgendaItem) => item.id;

  private onPressItem: Props['onPressItem'] = this.props.onPressItem;

  private renderItem: Props['renderItem'] = ({item}) => (
    <DefaultAgendaItem item={item} onPress={this.onPressItem} />
  );

  private renderDateHeader: Props['renderDateHeader'] = ({section}) => (
    <DateHeader section={section} />
  );

  private renderEmptyDate: Props['renderEmptyDate'] = ({section}) => {
    if (!section.data.length) {
      return <EmptyDate />;
    }
    return null;
  };

  private getItemLayout: Props['getItemLayout'] = (_data, index) => ({
    length: ITEM_HEIGHT,
    offset: index * ITEM_HEIGHT,
    index,
  });

  private loadUpcomingItems = (maxNumOfDays = 50) => {
    const sections: AgendaSection[] = [];
    for (let i = 0; i < maxNumOfDays; i += 1) {
      const section = this.upcomingItems.next();
      if (!section.done) {
        sections.push(section.value);
      } else {
        this.setState({hasMoreUpcoming: false});
        break;
      }
    }

    if (sections.length) {
      this.setState({sections: [...this.state.sections, ...sections]});
    }
  };

  private loadPastItems = (maxNumOfDays = 7) => {
    const sections: AgendaSection[] = [];
    for (let i = 0; i < maxNumOfDays; i += 1) {
      const section = this.pastItems.next();
      if (!section.done) {
        sections.push(section.value);
      } else {
        this.setState({hasMorePast: false});
        break;
      }
    }

    if (sections.length) {
      this.setState({sections: [...sections, ...this.state.sections]});
    }
  };

  private loadMoreFutureItems = () => {
    if (this.state.hasMoreUpcoming) {
      this.loadMoreTimer = setTimeout(() => {
        this.loadUpcomingItems();
      }, 0);
    }
  };

  public scrollToTop = () =>
    this.ref.current?.scrollToLocation({
      itemIndex: 0,
      sectionIndex: 0,
      viewPosition: 1,
    });

  public scrollToDate = (date: string) => {
    const sectionIndex = this.state.sections.findIndex(
      section => section.title === date,
    );

    if (sectionIndex !== -1) {
      this.ref.current?.scrollToLocation({
        itemIndex: 0,
        sectionIndex,
        viewPosition: 1,
      });
    }
  };

  componentDidMount = () => {
    this.mountTimer = setTimeout(() => {
      this.loadPastItems();
      this.loadUpcomingItems();
      if (this.state.sections.length) {
        this.scrollToDate(this.getSelectedDate().format(DATE_FORMAT));
      }
    }, 0);
  };

  componentWillUnmount = () => {
    if (this.mountTimer) {
      clearTimeout(this.mountTimer);
    }

    if (this.loadMoreTimer) {
      clearTimeout(this.loadMoreTimer);
    }
  };

  render(): React.ReactNode {
    const {
      loading,
      onRefresh,
      refreshControl,
      renderItem,
      renderDateHeader,
      renderEmptyDate,
      getItemLayout,
      keyExtractor,
      initialNumToRender,
      keyboardShouldPersistTaps,
      onEndReachedThreshold,
      ItemSeparatorComponent,
      ListEmptyComponent,
    } = this.props;

    return (
      <SectionList
        ref={this.ref}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        refreshControl={refreshControl}
        initialNumToRender={initialNumToRender}
        sections={this.state.sections}
        renderItem={renderItem || this.renderItem}
        renderSectionHeader={renderDateHeader || this.renderDateHeader}
        renderSectionFooter={renderEmptyDate || this.renderEmptyDate}
        keyExtractor={keyExtractor || this.keyExtractor}
        contentContainerStyle={styles.contentContainer}
        getItemLayout={getItemLayout || this.getItemLayout}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={this.loadMoreFutureItems}
        onEndReachedThreshold={onEndReachedThreshold}
      />
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
});

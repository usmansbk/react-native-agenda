import dayjs from 'dayjs';
import React, {createRef, RefObject} from 'react';
import {SectionList, SectionListProps, StyleSheet} from 'react-native';
import {AgendaItem, AgendaSection} from 'types';
import DayHeader from '~components/DayHeader';
import DefaultAgendaItem from '~components/DefaultAgendaItem';
import Divider from '~components/Divider';
import EmptyDay from '~components/EmptyDay';
import ListEmpty from '~components/ListEmpty';
import colors from '~config/colors';
import {DATE_FORMAT, ITEM_HEIGHT} from '~constants';
import {calendarGenerator} from '~utils/calendarGenerator';

type ListProps = SectionListProps<AgendaItem, AgendaSection>;

export interface AgendaListProps {
  loading?: boolean;
  animateScroll?: boolean;
  initialDate?: string;
  showEmptyInitialDay?: boolean;
  items: AgendaItem[];
  dateHeaderHeight?: number;
  onPressItem?: (item: AgendaItem) => void;
  onLayout?: ListProps['onLayout'];
  showsVerticalScrollIndicator?: ListProps['showsVerticalScrollIndicator'];
  keyboardShouldPersistTaps?: ListProps['keyboardShouldPersistTaps'];
  onEndReachedThreshold?: ListProps['onEndReachedThreshold'];
  refreshControl?: ListProps['refreshControl'];
  onRefresh?: ListProps['onRefresh'];
  keyExtractor?: ListProps['keyExtractor'];
  renderDayHeader?: ListProps['renderSectionHeader'];
  renderItem?: ListProps['renderItem'];
  renderEmptyDay?: ListProps['renderSectionFooter'];
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
  static displayName = 'AgendaList';

  static defaultProps: Readonly<Partial<Props>> = {
    showEmptyInitialDay: true,
    dateHeaderHeight: ITEM_HEIGHT,
    animateScroll: false,
    initialNumToRender: 1,
    showsVerticalScrollIndicator: false,
    ItemSeparatorComponent: Divider,
    ListEmptyComponent: ListEmpty,
  };

  state: Readonly<State> = {
    sections: [],
    hasMorePast: true,
    hasMoreUpcoming: true,
  };

  private initialLoadTimer: number | undefined;
  private loadMoreUpcomingTimer: number | undefined;

  private ref: RefObject<SectionList<AgendaItem, AgendaSection>> = createRef();

  private getInitialDate = () => {
    const {initialDate} = this.props;
    return initialDate ? dayjs(initialDate) : dayjs();
  };

  private upcomingItems = calendarGenerator({
    items: this.props.items,
    initialDate: this.getInitialDate(),
    showInitialDay: this.props.showEmptyInitialDay,
  });

  private pastItems = calendarGenerator({
    past: true,
    items: this.props.items,
    initialDate: this.getInitialDate(),
  });

  private keyExtractor: Props['keyExtractor'] = (item: AgendaItem) => item.id;

  private onPressItem: Props['onPressItem'] = this.props.onPressItem;

  private renderItem: Props['renderItem'] = ({item}) => (
    <DefaultAgendaItem item={item} onPress={this.onPressItem} />
  );

  private renderDayHeader: Props['renderDayHeader'] = ({section}) => (
    <DayHeader section={section} />
  );

  private renderEmptyDay: Props['renderEmptyDay'] = ({section}) => {
    if (!section.data.length) {
      return <EmptyDay />;
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
      this.loadMoreUpcomingTimer = setTimeout(() => {
        this.loadUpcomingItems();
      }, 0);
    }
  };

  public scrollToTop = () =>
    this.scrollToDate(this.getInitialDate().format(DATE_FORMAT));

  public scrollToDate = (date: string, itemIndex = 1, viewPosition = 0) => {
    const sectionIndex = this.state.sections.findIndex(
      section => section.title === date,
    );

    if (sectionIndex !== -1) {
      this.ref.current?.scrollToLocation({
        itemIndex,
        sectionIndex,
        viewPosition,
        viewOffset: this.props.dateHeaderHeight,
        animated: this.props.animateScroll,
      });
    }
  };

  componentDidMount = () => {
    this.initialLoadTimer = setTimeout(() => {
      this.loadPastItems();
      this.loadUpcomingItems();
      if (this.state.sections.length) {
        this.scrollToTop();
      }
    }, 0);
  };

  componentWillUnmount = () => {
    if (this.initialLoadTimer !== undefined) {
      clearTimeout(this.initialLoadTimer);
    }

    if (this.loadMoreUpcomingTimer !== undefined) {
      clearTimeout(this.loadMoreUpcomingTimer);
    }
  };

  render(): React.ReactNode {
    const {
      loading,
      onRefresh,
      onLayout,
      refreshControl,
      renderItem,
      renderDayHeader,
      renderEmptyDay,
      getItemLayout,
      keyExtractor,
      initialNumToRender,
      keyboardShouldPersistTaps,
      showsVerticalScrollIndicator,
      onEndReachedThreshold,
      ItemSeparatorComponent,
      ListEmptyComponent,
    } = this.props;

    return (
      <SectionList
        ref={this.ref}
        stickySectionHeadersEnabled
        refreshing={loading}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={refreshControl}
        initialNumToRender={initialNumToRender}
        sections={this.state.sections}
        renderItem={renderItem || this.renderItem}
        renderSectionHeader={renderDayHeader || this.renderDayHeader}
        renderSectionFooter={renderEmptyDay || this.renderEmptyDay}
        keyExtractor={keyExtractor || this.keyExtractor}
        contentContainerStyle={styles.contentContainer}
        getItemLayout={getItemLayout || this.getItemLayout}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={this.loadMoreFutureItems}
        onEndReachedThreshold={onEndReachedThreshold}
        onLayout={onLayout}
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

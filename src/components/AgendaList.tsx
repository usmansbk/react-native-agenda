import {FlashList, FlashListProps} from '@shopify/flash-list';
import dayjs from 'dayjs';
import React from 'react';
import {StyleSheet} from 'react-native';
import {RRule, Weekday} from 'rrule';
import colors from '~config/colors';
import {
  COMMON_NUMBER_OF_DAYS_OFFSET,
  DATE_FORMAT,
  DAY_FORMATS,
  ITEM_HEIGHT,
  MAX_NUMBER_OF_DAYS_PER_BATCH,
} from '~constants';
import {AgendaItem, Section} from '~types';
import {calendarGenerator} from '~utils/calendarGenerator';
import DayHeader from './DayHeader';
import DefaultAgendaItem from './DefaultAgendaItem';
import Divider from './Divider';
import Footer from './Footer';
import Header from './Header';
import ListEmpty from './ListEmpty';

type ListProps = FlashListProps<Section>;

export enum CalendarMode {
  UPCOMING,
  PAST,
}

export interface AgendaListProps {
  loadPastText?: string;
  loadUpcomingText?: string;
  weekStart?: Weekday;
  loading?: boolean;
  maxDaysPerBatch?: number;
  animateScrollTo?: boolean;
  items: AgendaItem[];
  itemHeight?: number;
  onPressItem?: (item: AgendaItem) => void;
  testID?: ListProps['testID'];
  contentContainerStyle?: ListProps['contentContainerStyle'];
  onScroll?: ListProps['onScroll'];
  showsVerticalScrollIndicator?: ListProps['showsVerticalScrollIndicator'];
  keyboardShouldPersistTaps?: ListProps['keyboardShouldPersistTaps'];
  onEndReachedThreshold?: ListProps['onEndReachedThreshold'];
  refreshControl?: ListProps['refreshControl'];
  onRefresh?: ListProps['onRefresh'];
  keyExtractor?: ListProps['keyExtractor'];
  renderItem?: ListProps['renderItem'];
  ItemSeparatorComponent?: ListProps['ItemSeparatorComponent'];
  ListEmptyComponent?: ListProps['ListEmptyComponent'];
  ListFooterComponent?: ListProps['ListFooterComponent'];
}

type Props = AgendaListProps;

interface State {
  upcoming: Section[];
  past: Section[];
  hasMoreUpcoming: boolean;
  hasMorePast: boolean;
  loading: boolean;
  mode: CalendarMode;
  initialScrollIndex: number;
}

export default class AgendaList extends React.PureComponent<Props, State> {
  static displayName = 'AgendaList';

  static defaultProps: Readonly<Partial<Props>> = {
    maxDaysPerBatch: MAX_NUMBER_OF_DAYS_PER_BATCH,
    weekStart: RRule.SU,
    itemHeight: ITEM_HEIGHT,
    animateScrollTo: true,
    showsVerticalScrollIndicator: false,
    ItemSeparatorComponent: Divider,
    ListEmptyComponent: ListEmpty,
    ListFooterComponent: Footer,
    onEndReachedThreshold: 1,
    loadPastText: 'Load Past',
    loadUpcomingText: 'Load Upcoming',
  };

  state: Readonly<State> = {
    upcoming: [],
    past: [],
    hasMorePast: true,
    hasMoreUpcoming: true,
    loading: true,
    mode: CalendarMode.UPCOMING,
    initialScrollIndex: 0,
  };

  private ref?: FlashList<Section> | null;

  private _ref = (ref: typeof this.ref) => {
    this.ref = ref;
  };

  private get getInitialDate() {
    return dayjs.utc();
  }

  private get getInitialDateString() {
    return this.getInitialDate.format(DATE_FORMAT);
  }

  private getItemType: ListProps['getItemType'] = item => {
    return typeof item === 'string' ? 'sectionHeader' : 'row';
  };

  private calendarConfig = {
    items: this.props.items,
    weekStart: this.props.weekStart,
  };

  private upcomingItems = calendarGenerator({
    ...this.calendarConfig,
    initialDate: this.getInitialDate.subtract(
      COMMON_NUMBER_OF_DAYS_OFFSET,
      'days',
    ),
  });

  private pastItems = calendarGenerator({
    ...this.calendarConfig,
    initialDate: this.getInitialDate.add(COMMON_NUMBER_OF_DAYS_OFFSET, 'days'),
    past: true,
  });

  private onPressItem: Props['onPressItem'] = this.props.onPressItem;

  private keyExtractor: Props['keyExtractor'] = (item, index) => {
    const {mode} = this.state;
    if (typeof item === 'string') {
      return mode + item + index;
    }

    return mode + item.id + index;
  };

  private renderItem: Props['renderItem'] = ({item}) => {
    if (typeof item === 'string') {
      const title = dayjs(item).calendar(null, DAY_FORMATS);
      return <DayHeader title={title} />;
    }
    return <DefaultAgendaItem item={item} onPress={this.onPressItem} />;
  };

  private getUpcomingItems = (maxNumOfDays = MAX_NUMBER_OF_DAYS_PER_BATCH) => {
    const sections: (string | AgendaItem)[] = [];
    let hasMoreUpcoming = this.state.hasMoreUpcoming;

    for (let i = 0; i < maxNumOfDays; i += 1) {
      const section = this.upcomingItems.next();
      if (!section.done) {
        sections.push(section.value.title, ...section.value.data);
      } else {
        hasMoreUpcoming = !section.done;
        break;
      }
    }
    return {
      sections,
      hasMoreUpcoming,
    };
  };

  private getPastItems = (maxNumOfDays = MAX_NUMBER_OF_DAYS_PER_BATCH) => {
    const sections: Section[] = [];
    let hasMorePast = this.state.hasMorePast;

    for (let i = 0; i < maxNumOfDays; i += 1) {
      const section = this.pastItems.next();
      if (!section.done) {
        sections.push(...section.value.data, section.value.title);
      } else {
        hasMorePast = !section.done;
        break;
      }
    }

    return {
      sections,
      hasMorePast,
    };
  };

  private loadMoreFutureItems = () => {
    if (this.state.hasMoreUpcoming) {
      const {sections, hasMoreUpcoming} = this.getUpcomingItems();

      this.setState({
        upcoming: sections.length
          ? [...this.state.upcoming, ...sections]
          : this.state.upcoming,
        hasMoreUpcoming,
      });
    }
  };

  private loadMorePastItems = () => {
    if (this.state.hasMorePast) {
      const {sections, hasMorePast} = this.getPastItems();

      this.setState({
        past: sections.length
          ? [...this.state.past, ...sections]
          : this.state.past,
        hasMorePast,
      });
    }
  };

  private onEndReached: ListProps['onEndReached'] = () => {
    if (this.state.mode === CalendarMode.PAST) {
      this.loadMorePastItems();
    } else {
      this.loadMoreFutureItems();
    }
  };

  private getTopIndex = (sections: Section[]) => {
    const index = sections.findIndex(section => {
      if (typeof section === 'string') {
        return dayjs(section).isSameOrAfter(this.getInitialDate, 'day');
      }
      return false;
    });

    const headerOffset = 1;

    return index < 0 ? index : index + headerOffset;
  };

  private onScroll: ListProps['onScroll'] = e => {
    this.props.onScroll?.(e);
  };

  public scrollToTop = () =>
    this.ref?.scrollToIndex({
      index: 0,
      viewPosition: 0,
      animated: this.props.animateScrollTo,
    });

  public scrollToDate = (date: string, viewPosition = 0) => {
    this.ref?.scrollToItem({
      item: date,
      viewPosition,
      animated: this.props.animateScrollTo,
    });
  };

  private changeScrollDirection = () => {
    const isPast = this.state.mode === CalendarMode.PAST;

    this.setState(
      {
        mode: isPast ? CalendarMode.UPCOMING : CalendarMode.PAST,
      },
      () => {
        this.scrollToDate(this.getInitialDateString);
      },
    );
  };

  private renderHeader = () => {
    const isPast = this.state.mode === CalendarMode.PAST;
    const {loadPastText, loadUpcomingText} = this.props;
    return (
      <Header
        title={isPast ? loadUpcomingText : loadPastText}
        onPress={this.changeScrollDirection}
      />
    );
  };

  componentDidMount = () => {
    const {maxDaysPerBatch, items} = this.props;
    if (items.length) {
      const {sections: past, hasMorePast} = this.getPastItems(maxDaysPerBatch);
      const {sections: upcoming, hasMoreUpcoming} =
        this.getUpcomingItems(maxDaysPerBatch);
      const initialScrollIndex = this.getTopIndex(upcoming);

      this.setState({
        upcoming: upcoming.length ? upcoming : this.state.upcoming,
        past: past.length ? past : this.state.past,
        hasMorePast,
        hasMoreUpcoming,
        loading: false,
        initialScrollIndex,
      });
    } else {
      this.setState({loading: false});
    }
  };

  render(): React.ReactNode {
    const {
      items,
      itemHeight,
      testID,
      loading,
      onRefresh,
      refreshControl,
      renderItem,
      keyExtractor,
      keyboardShouldPersistTaps,
      showsVerticalScrollIndicator,
      ListEmptyComponent,
      ListFooterComponent,
      ItemSeparatorComponent,
      onEndReachedThreshold,
      contentContainerStyle,
    } = this.props;

    const isPast = this.state.mode === CalendarMode.PAST;
    const data = isPast ? this.state.past : this.state.upcoming;

    return (
      <FlashList
        ref={this._ref}
        data={data}
        contentContainerStyle={styles.contentContainer || contentContainerStyle}
        testID={testID}
        inverted={isPast}
        initialScrollIndex={this.state.initialScrollIndex}
        estimatedItemSize={itemHeight || ITEM_HEIGHT}
        estimatedFirstItemOffset={itemHeight || ITEM_HEIGHT}
        renderItem={renderItem || this.renderItem}
        refreshing={loading || this.state.loading}
        onRefresh={onRefresh}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyExtractor={keyExtractor || this.keyExtractor}
        getItemType={this.getItemType}
        ListEmptyComponent={!items.length ? ListEmptyComponent : null}
        ListHeaderComponent={!this.state.loading ? this.renderHeader : null}
        ListFooterComponent={
          (isPast ? this.state.hasMorePast : this.state.hasMoreUpcoming)
            ? ListFooterComponent
            : null
        }
        ItemSeparatorComponent={ItemSeparatorComponent}
        onScroll={this.onScroll}
      />
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: colors.background,
  },
});

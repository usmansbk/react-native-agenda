import {FlashList, FlashListProps} from '@shopify/flash-list';
import dayjs from 'dayjs';
import React from 'react';
import {StyleSheet} from 'react-native';
import {RRule, Weekday} from 'rrule';
import colors from '~config/colors';
import {
  DAY_FORMATS,
  ITEM_HEIGHT,
  MAX_NUMBER_OF_FUTURE_DAYS,
  MAX_NUMBER_OF_PAST_DAYS,
} from '~constants';
import {AgendaItem, Section} from '~types';
import {calendarGenerator} from '~utils/calendarGenerator';
import DayHeader from './DayHeader';
import DefaultAgendaItem from './DefaultAgendaItem';
import Divider from './Divider';
import Footer from './Footer';
import ListEmpty from './ListEmpty';

type ListProps = FlashListProps<Section>;

export enum CalendarMode {
  UPCOMING,
  PAST,
}

export interface AgendaListProps {
  mode?: CalendarMode;
  weekStart?: Weekday;
  loading?: boolean;
  maxPastDaysPerBatch?: number;
  maxFutureDaysPerBatch?: number;
  animateScrollToTop?: boolean;
  initialDate?: string;
  showEmptyInitialDay?: boolean;
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
}

export default class AgendaList extends React.PureComponent<Props, State> {
  static displayName = 'AgendaList';

  static defaultProps: Readonly<Partial<Props>> = {
    maxPastDaysPerBatch: MAX_NUMBER_OF_PAST_DAYS,
    maxFutureDaysPerBatch: MAX_NUMBER_OF_FUTURE_DAYS,
    weekStart: RRule.SU,
    showEmptyInitialDay: false,
    itemHeight: ITEM_HEIGHT,
    animateScrollToTop: false,
    showsVerticalScrollIndicator: false,
    ItemSeparatorComponent: Divider,
    ListEmptyComponent: ListEmpty,
    ListFooterComponent: Footer,
    onEndReachedThreshold: 1,
    mode: CalendarMode.UPCOMING,
  };

  state: Readonly<State> = {
    upcoming: [],
    past: [],
    hasMorePast: true,
    hasMoreUpcoming: true,
    loading: true,
  };

  private initialLoadTimer: number | undefined;
  private loadMoreUpcomingTimer: number | undefined;

  private ref?: FlashList<Section> | null;

  private _ref = (ref: typeof this.ref) => {
    this.ref = ref;
  };

  private get getInitialDate() {
    const {initialDate} = this.props;
    return initialDate ? dayjs(initialDate) : dayjs();
  }

  private getItemType: ListProps['getItemType'] = item => {
    return typeof item === 'string' ? 'sectionHeader' : 'row';
  };

  private calendarConfig = {
    items: this.props.items,
    initialDate: this.getInitialDate,
    weekStart: this.props.weekStart,
  };

  private upcomingItems = calendarGenerator({
    ...this.calendarConfig,
    showInitialDay: this.props.showEmptyInitialDay,
  });

  private pastItems = calendarGenerator({
    ...this.calendarConfig,
    past: true,
  });

  private onPressItem: Props['onPressItem'] = this.props.onPressItem;

  private keyExtractor: Props['keyExtractor'] = (item, index) => String(index);

  private renderItem: Props['renderItem'] = ({item}) => {
    if (typeof item === 'string') {
      const title = dayjs(item).calendar(null, DAY_FORMATS);
      return <DayHeader title={title} />;
    }
    return <DefaultAgendaItem item={item} onPress={this.onPressItem} />;
  };

  private getUpcomingItems = (maxNumOfDays = MAX_NUMBER_OF_FUTURE_DAYS) => {
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

  private getPastItems = (maxNumOfDays = MAX_NUMBER_OF_PAST_DAYS) => {
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
      this.loadMoreUpcomingTimer = setTimeout(() => {
        const {sections, hasMoreUpcoming} = this.getUpcomingItems();

        this.setState({
          upcoming: sections.length
            ? [...this.state.upcoming, ...sections]
            : this.state.upcoming,
          hasMoreUpcoming,
        });
      }, 0);
    }
  };

  private loadMorePastItems = () => {
    if (this.state.hasMorePast) {
      this.loadMoreUpcomingTimer = setTimeout(() => {
        const {sections, hasMorePast} = this.getPastItems();

        this.setState({
          past: sections.length
            ? [...this.state.past, ...sections]
            : this.state.past,
          hasMorePast,
        });
      }, 0);
    }
  };

  private onEndReached: ListProps['onEndReached'] = () => {
    if (this.props.mode === CalendarMode.UPCOMING) {
      this.loadMoreFutureItems();
    } else {
      this.loadMorePastItems();
    }
  };

  private onScroll: ListProps['onScroll'] = e => {
    this.props.onScroll?.(e);
  };

  public scrollToTop = () =>
    this.ref?.scrollToIndex({
      index: 0,
      viewPosition: 0,
      animated: false,
    });

  public scrollToDate = (date: string, viewPosition = 0) => {
    this.ref?.scrollToItem({
      item: date,
      viewPosition,
      animated: this.props.animateScrollToTop,
    });
  };

  componentDidMount = () => {
    if (this.props.items.length) {
      this.initialLoadTimer = setTimeout(() => {
        const {sections: past, hasMorePast} = this.getPastItems(
          this.props.maxPastDaysPerBatch,
        );
        const {sections: upcoming, hasMoreUpcoming} = this.getUpcomingItems(
          this.props.maxFutureDaysPerBatch,
        );

        this.setState({
          upcoming: upcoming.length ? upcoming : this.state.upcoming,
          past: past.length ? past : this.state.past,
          hasMorePast,
          hasMoreUpcoming,
          loading: false,
        });
      }, 0);
    } else {
      this.setState({loading: false});
    }
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
      mode,
    } = this.props;

    return (
      <FlashList
        ref={this._ref}
        data={this.state.upcoming}
        contentContainerStyle={styles.contentContainer || contentContainerStyle}
        testID={testID}
        inverted={mode === CalendarMode.PAST}
        estimatedItemSize={itemHeight || ITEM_HEIGHT}
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
        ListFooterComponent={
          this.state.hasMoreUpcoming ? ListFooterComponent : null
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

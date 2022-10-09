import {FlashList, FlashListProps} from '@shopify/flash-list';
import dayjs from 'dayjs';
import React, {createRef, RefObject} from 'react';
import {StyleSheet} from 'react-native';
import {RRule, Weekday} from 'rrule';
import DefaultAgendaItem from '~components/DefaultAgendaItem';
import Divider from '~components/Divider';
import ListEmpty from '~components/ListEmpty';
import colors from '~config/colors';
import {
  DATE_FORMAT,
  DAY_FORMATS,
  ITEM_HEIGHT,
  MAX_NUMBER_OF_FUTURE_DAYS,
  MAX_NUMBER_OF_PAST_DAYS,
} from '~constants';
import {AgendaItem} from '~types';
import {calendarGenerator} from '~utils/calendarGenerator';
import DayHeader from './DayHeader';
import Paginate from './Paginate';

type Section = string | AgendaItem;
type ListProps = FlashListProps<Section>;

export interface AgendaListProps {
  weekStart?: Weekday;
  loading?: boolean;
  pastItemsMaxDays?: number;
  animateScrollToTop?: boolean;
  initialDate?: string;
  showEmptyInitialDay?: boolean;
  items: AgendaItem[];
  dateHeaderHeight?: number;
  onPressItem?: (item: AgendaItem) => void;
  testID?: ListProps['testID'];
  style?: ListProps['style'];
  contentContainerStyle?: ListProps['contentContainerStyle'];
  onLayout?: ListProps['onLayout'];
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
}

type Props = AgendaListProps;

interface State {
  sections: Section[];
  hasMoreUpcoming: boolean;
  hasMorePast: boolean;
}

export default class AgendaList extends React.PureComponent<Props, State> {
  static displayName = 'AgendaList';

  static defaultProps: Readonly<Partial<Props>> = {
    pastItemsMaxDays: MAX_NUMBER_OF_PAST_DAYS,
    weekStart: RRule.SU,
    showEmptyInitialDay: true,
    dateHeaderHeight: ITEM_HEIGHT,
    animateScrollToTop: false,
    showsVerticalScrollIndicator: false,
    ItemSeparatorComponent: Divider,
    ListEmptyComponent: ListEmpty,
    onEndReachedThreshold: 0.5,
  };

  state: Readonly<State> = {
    sections: [],
    hasMorePast: true,
    hasMoreUpcoming: true,
  };

  private initialLoadTimer: number | undefined;
  private loadMoreUpcomingTimer: number | undefined;

  private ref: RefObject<FlashList<Section>> = createRef();

  private getInitialDate = () => {
    const {initialDate} = this.props;
    return initialDate ? dayjs(initialDate) : dayjs();
  };

  private getItemType: ListProps['getItemType'] = item => {
    return typeof item === 'string' ? 'sectionHeader' : 'row';
  };

  private calendarConfig = {
    items: this.props.items,
    initialDate: this.getInitialDate(),
    weekStart: this.props.weekStart,
  };

  private upcomingItems = calendarGenerator({
    ...this.calendarConfig,
    showInitialDay: true,
  });

  private pastItems = calendarGenerator({
    ...this.calendarConfig,
    past: true,
  });

  private onPressItem: Props['onPressItem'] = this.props.onPressItem;

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
        sections.push(section.value.title, ...section.value.data);
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
          sections: sections.length
            ? [...this.state.sections, ...sections]
            : this.state.sections,
          hasMoreUpcoming,
        });
      }, 0);
    }
  };

  public scrollToTop = () =>
    this.scrollToDate(this.getInitialDate().format(DATE_FORMAT));

  public scrollToDate = (date: string, viewPosition = 0) => {
    const index = this.state.sections.findIndex(section => section === date);

    if (index !== -1) {
      this.ref.current?.scrollToIndex({
        index,
        viewPosition,
        animated: this.props.animateScrollToTop,
      });
    }
  };

  componentDidMount = () => {
    if (this.props.items.length) {
      this.initialLoadTimer = setTimeout(() => {
        const {sections: pastSections, hasMorePast} = this.getPastItems(
          this.props.pastItemsMaxDays,
        );
        const {sections: upcomingSections, hasMoreUpcoming} =
          this.getUpcomingItems();

        const sections = [...pastSections, ...upcomingSections];
        this.setState(
          {
            sections: sections.length ? sections : this.state.sections,
            hasMorePast,
            hasMoreUpcoming,
          },
          () => {
            if (this.state.sections.length) {
              this.scrollToTop();
            }
          },
        );
      }, 0);
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
      testID,
      loading,
      onRefresh,
      refreshControl,
      renderItem,
      keyExtractor,
      keyboardShouldPersistTaps,
      showsVerticalScrollIndicator,
      ListEmptyComponent,
      ItemSeparatorComponent,
      onEndReachedThreshold,
    } = this.props;

    return (
      <FlashList
        ref={this.ref}
        data={this.state.sections}
        contentContainerStyle={styles.container}
        testID={testID}
        estimatedItemSize={ITEM_HEIGHT}
        renderItem={renderItem || this.renderItem}
        refreshing={loading}
        onRefresh={onRefresh}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        onEndReached={this.loadMoreFutureItems}
        onEndReachedThreshold={onEndReachedThreshold}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyExtractor={keyExtractor}
        getItemType={this.getItemType}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={this.state.hasMoreUpcoming ? Paginate : null}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
});

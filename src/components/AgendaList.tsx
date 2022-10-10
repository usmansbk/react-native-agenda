import {FlashList, FlashListProps} from '@shopify/flash-list';
import dayjs from 'dayjs';
import React, {createRef, RefObject} from 'react';
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

export interface AgendaListProps {
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
  ListFooterComponent?: ListProps['ListFooterComponent'];
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
    maxPastDaysPerBatch: MAX_NUMBER_OF_PAST_DAYS,
    maxFutureDaysPerBatch: MAX_NUMBER_OF_FUTURE_DAYS,
    weekStart: RRule.SU,
    showEmptyInitialDay: true,
    itemHeight: ITEM_HEIGHT,
    animateScrollToTop: false,
    showsVerticalScrollIndicator: false,
    ItemSeparatorComponent: Divider,
    ListEmptyComponent: ListEmpty,
    ListFooterComponent: Footer,
    onEndReachedThreshold: 1,
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

  public scrollToTop = () => this.scrollToDate('2023-11-10');

  public scrollToDate = (date: string, viewPosition = 0) => {
    this.ref.current?.scrollToItem({
      item: date,
      viewPosition,
      animated: this.props.animateScrollToTop,
    });
  };

  componentDidMount = () => {
    if (this.props.items.length) {
      this.initialLoadTimer = setTimeout(() => {
        const {sections: pastSections, hasMorePast} = this.getPastItems(
          this.props.maxPastDaysPerBatch,
        );
        const {sections: upcomingSections, hasMoreUpcoming} =
          this.getUpcomingItems(this.props.maxFutureDaysPerBatch);

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
      style,
    } = this.props;

    return (
      <FlashList
        ref={this.ref}
        data={this.state.sections}
        style={style}
        contentContainerStyle={contentContainerStyle || styles.container}
        testID={testID}
        estimatedItemSize={itemHeight || ITEM_HEIGHT}
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
        ListEmptyComponent={items.length ? ListEmptyComponent : null}
        ListFooterComponent={
          this.state.hasMoreUpcoming ? ListFooterComponent : null
        }
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

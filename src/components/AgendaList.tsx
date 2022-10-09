import dayjs from 'dayjs';
import React, {createRef, RefObject} from 'react';
import {SectionList, SectionListProps, StyleSheet} from 'react-native';
import {RRule, Weekday} from 'rrule';
import DayHeader from '~components/DayHeader';
import DefaultAgendaItem from '~components/DefaultAgendaItem';
import Divider from '~components/Divider';
import EmptyDay from '~components/EmptyDay';
import ListEmpty from '~components/ListEmpty';
import colors from '~config/colors';
import {
  DATE_FORMAT,
  ITEM_HEIGHT,
  MAX_NUMBER_OF_FUTURE_DAYS,
  MAX_NUMBER_OF_PAST_DAYS,
} from '~constants';
import {AgendaItem, AgendaSection} from '~types';
import {calendarGenerator} from '~utils/calendarGenerator';

type ListProps = SectionListProps<AgendaItem, AgendaSection>;

export interface AgendaListProps {
  weekStart?: Weekday;
  loading?: boolean;
  animateScrollToTop?: boolean;
  initialDate?: string;
  showEmptyInitialDay?: boolean;
  items: AgendaItem[];
  dateHeaderHeight?: number;
  onPressItem?: (item: AgendaItem) => void;
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
    weekStart: RRule.SU,
    showEmptyInitialDay: true,
    dateHeaderHeight: ITEM_HEIGHT,
    animateScrollToTop: false,
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

  private keyExtractor: Props['keyExtractor'] = (item: AgendaItem) => item.id;

  private onPressItem: Props['onPressItem'] = this.props.onPressItem;

  private renderItem: Props['renderItem'] = ({item}) => (
    <DefaultAgendaItem item={item} onPress={this.onPressItem} />
  );

  private renderDayHeader: Props['renderDayHeader'] = ({section}) => (
    <DayHeader date={section.title} />
  );

  private renderEmptyDay: Props['renderEmptyDay'] = ({section}) => {
    if (!section.data.length) {
      return <EmptyDay />;
    }
    return null;
  };

  private getItemLayout: Props['getItemLayout'] = (_data, index) => {
    return {
      length: ITEM_HEIGHT,
      offset: index * ITEM_HEIGHT,
      index,
    };
  };

  private getUpcomingItems = (maxNumOfDays = MAX_NUMBER_OF_FUTURE_DAYS) => {
    const sections: AgendaSection[] = [];
    let hasMoreUpcoming = this.state.hasMoreUpcoming;

    for (let i = 0; i < maxNumOfDays; i += 1) {
      const section = this.upcomingItems.next();
      if (!section.done) {
        sections.push(section.value);
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
    const sections: AgendaSection[] = [];
    let hasMorePast = this.state.hasMorePast;

    for (let i = 0; i < maxNumOfDays; i += 1) {
      const section = this.pastItems.next();
      if (!section.done) {
        sections.push(section.value);
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
        animated: this.props.animateScrollToTop,
      });
    }
  };

  componentDidMount = () => {
    this.initialLoadTimer = setTimeout(() => {
      const {sections: pastSections, hasMorePast} = this.getPastItems();
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
      style,
      contentContainerStyle,
      loading,
      onRefresh,
      onLayout,
      onScroll,
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
        style={[styles.container, style]}
        refreshing={loading}
        onRefresh={onRefresh}
        onScroll={onScroll}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={refreshControl}
        initialNumToRender={initialNumToRender}
        sections={this.state.sections}
        renderItem={renderItem || this.renderItem}
        renderSectionHeader={renderDayHeader || this.renderDayHeader}
        renderSectionFooter={renderEmptyDay || this.renderEmptyDay}
        keyExtractor={keyExtractor || this.keyExtractor}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
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
  container: {
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

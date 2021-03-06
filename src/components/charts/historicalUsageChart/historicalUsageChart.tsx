import 'components/charts/common/charts-common.scss';

import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  createContainer,
  getInteractiveLegendEvents,
  getInteractiveLegendItemStyles,
} from '@patternfly/react-charts';
import { Title } from '@patternfly/react-core';
import { default as ChartTheme } from 'components/charts/chartTheme';
import { getDateRange, getMaxValue } from 'components/charts/common/chartUtils';
import { getTooltipContent, getUsageRangeString } from 'components/charts/common/chartUtils';
import getDate from 'date-fns/get_date';
import i18next from 'i18next';
import React from 'react';
import { FormatOptions, ValueFormatter } from 'utils/formatValue';
import { DomainTuple, VictoryStyleInterface } from 'victory-core';

import { chartStyles, styles } from './historicalUsageChart.styles';

interface HistoricalUsageChartProps {
  adjustContainerHeight?: boolean;
  containerHeight?: number;
  currentLimitData?: any;
  currentRequestData?: any;
  currentUsageData: any;
  formatDatumValue?: ValueFormatter;
  formatDatumOptions?: FormatOptions;
  height: number;
  legendItemsPerRow?: number;
  padding?: any;
  previousLimitData?: any;
  previousRequestData?: any;
  previousUsageData?: any;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

interface HistoricalUsageChartData {
  name?: string;
}

interface HistoricalUsageChartLegendItem {
  name?: string;
  symbol?: any;
  tooltip?: string;
}

interface HistoricalUsageChartSeries {
  childName?: string;
  data?: [HistoricalUsageChartData];
  legendItem?: HistoricalUsageChartLegendItem;
  style?: VictoryStyleInterface;
}

interface State {
  cursorVoronoiContainer?: any;
  hiddenSeries: Set<number>;
  series?: HistoricalUsageChartSeries[];
  width: number;
}

class HistoricalUsageChart extends React.Component<HistoricalUsageChartProps, State> {
  private containerRef = React.createRef<HTMLDivElement>();
  public state: State = {
    hiddenSeries: new Set(),
    width: 0,
  };

  public componentDidMount() {
    setTimeout(() => {
      if (this.containerRef.current) {
        this.setState({ width: this.containerRef.current.clientWidth });
      }
      window.addEventListener('resize', this.handleResize);
    });
    this.initDatum();
  }

  public componentDidUpdate(prevProps: HistoricalUsageChartProps) {
    if (
      prevProps.currentLimitData !== this.props.currentLimitData ||
      prevProps.currentRequestData !== this.props.currentRequestData ||
      prevProps.currentUsageData !== this.props.currentUsageData ||
      prevProps.previousLimitData !== this.props.previousLimitData ||
      prevProps.previousRequestData !== this.props.previousRequestData ||
      prevProps.previousUsageData !== this.props.previousUsageData
    ) {
      this.initDatum();
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  private initDatum = () => {
    const {
      currentLimitData,
      currentRequestData,
      currentUsageData,
      previousLimitData,
      previousRequestData,
      previousUsageData,
    } = this.props;

    const limitKey = 'chart.limit_legend_label';
    const limitTooltipKey = 'chart.limit_legend_tooltip';
    const requestKey = 'chart.requests_legend_label';
    const requestTooltipKey = 'chart.requests_legend_tooltip';
    const usageKey = 'chart.usage_legend_label';
    const usageTooltipKey = 'chart.usage_legend_tooltip';

    // Show all legends, regardless of length -- https://github.com/project-koku/koku-ui/issues/248

    const series: HistoricalUsageChartSeries[] = [
      {
        childName: 'previousUsage',
        data: previousUsageData,
        legendItem: {
          name: getUsageRangeString(previousUsageData, usageKey, true, true, 1),
          symbol: {
            fill: chartStyles.previousColorScale[0],
            type: 'minus',
          },
          tooltip: getUsageRangeString(previousUsageData, usageTooltipKey, false, false, 1),
        },
        style: {
          data: {
            ...chartStyles.previousUsageData,
            stroke: chartStyles.previousColorScale[0],
          },
        },
      },
      {
        childName: 'currentUsage',
        data: currentUsageData,
        legendItem: {
          name: getUsageRangeString(currentUsageData, usageKey, true, false),
          symbol: {
            fill: chartStyles.currentColorScale[0],
            type: 'minus',
          },
          tooltip: getUsageRangeString(currentUsageData, usageTooltipKey, false, false),
        },
        style: {
          data: {
            ...chartStyles.currentUsageData,
            stroke: chartStyles.currentColorScale[0],
          },
        },
      },
      {
        childName: 'previousRequest',
        data: previousRequestData,
        legendItem: {
          name: getUsageRangeString(previousRequestData, requestKey, true, true, 1),
          symbol: {
            fill: chartStyles.previousColorScale[1],
            type: 'dash',
          },
          tooltip: getUsageRangeString(previousRequestData, requestTooltipKey, false, false, 1),
        },
        style: {
          data: {
            ...chartStyles.previousRequestData,
            stroke: chartStyles.previousColorScale[1],
          },
        },
      },
      {
        childName: 'currentRequest',
        data: currentRequestData,
        legendItem: {
          name: getUsageRangeString(currentRequestData, requestKey, true, false),
          symbol: {
            fill: chartStyles.currentColorScale[1],
            type: 'dash',
          },
          tooltip: getUsageRangeString(currentRequestData, requestTooltipKey, false, false),
        },
        style: {
          data: {
            ...chartStyles.currentRequestData,
            stroke: chartStyles.currentColorScale[1],
          },
        },
      },
      {
        childName: 'previousLimit',
        data: previousLimitData,
        legendItem: {
          name: getUsageRangeString(previousLimitData, limitKey, true, true, 1),
          symbol: {
            fill: chartStyles.previousColorScale[2],
            type: 'minus',
          },
          tooltip: getUsageRangeString(previousLimitData, limitTooltipKey, false, false, 1),
        },
        style: {
          data: {
            ...chartStyles.previousLimitData,
            stroke: chartStyles.previousColorScale[2],
          },
        },
      },
      {
        childName: 'currentLimit',
        data: currentLimitData,
        legendItem: {
          name: getUsageRangeString(currentLimitData, limitKey, true, false),
          symbol: {
            fill: chartStyles.currentColorScale[2],
            type: 'minus',
          },
          tooltip: getUsageRangeString(currentLimitData, limitTooltipKey, false, false),
        },
        style: {
          data: {
            ...chartStyles.currentLimitData,
            stroke: chartStyles.currentColorScale[2],
          },
        },
      },
    ];
    const cursorVoronoiContainer = this.getCursorVoronoiContainer();
    this.setState({ cursorVoronoiContainer, series });
  };

  private handleResize = () => {
    if (this.containerRef.current) {
      this.setState({ width: this.containerRef.current.clientWidth });
    }
  };

  private getChart = (series: HistoricalUsageChartSeries, index: number) => {
    const { hiddenSeries } = this.state;
    return (
      <ChartArea
        data={!hiddenSeries.has(index) ? series.data : [{ y: null }]}
        interpolation="monotoneX"
        key={series.childName}
        name={series.childName}
        style={series.style}
      />
    );
  };

  // Returns CursorVoronoiContainer component
  private getCursorVoronoiContainer = () => {
    // Note: Container order is important
    const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

    return (
      <CursorVoronoiContainer
        cursorDimension="x"
        labels={this.getTooltipLabel}
        mouseFollowTooltips
        voronoiDimension="x"
        voronoiPadding={{
          bottom: 130,
          left: 8,
          right: 8,
          top: 8,
        }}
      />
    );
  };

  private getDomain() {
    const { series } = this.state;

    const domain: { x: DomainTuple; y?: DomainTuple } = { x: [1, 31] };
    let maxValue = 0;

    if (series) {
      series.forEach((s: any, index) => {
        if (!this.isSeriesHidden(index) && s.data && s.data.length !== 0) {
          const max = getMaxValue(s.data);
          maxValue = Math.max(maxValue, max);
        }
      });
    }

    const max = maxValue > 0 ? Math.ceil(maxValue + maxValue * 0.1) : 0;
    if (max > 0) {
      domain.y = [0, max];
    }
    return domain;
  }

  private getEndDate() {
    const { currentRequestData, currentUsageData, previousRequestData, previousUsageData } = this.props;
    const currentRequestDate = currentRequestData ? getDate(getDateRange(currentRequestData, true, true)[1]) : 0;
    const currentUsageDate = currentUsageData ? getDate(getDateRange(currentUsageData, true, true)[1]) : 0;
    const previousRequestDate = previousRequestData ? getDate(getDateRange(previousRequestData, true, true)[1]) : 0;
    const previousUsageDate = previousUsageData ? getDate(getDateRange(previousUsageData, true, true)[1]) : 0;

    return currentRequestDate > 0 || currentUsageDate > 0 || previousRequestDate > 0 || previousUsageDate > 0
      ? Math.max(currentRequestDate, currentUsageDate, previousRequestDate, previousUsageDate)
      : 31;
  }

  private getLegend = () => {
    const { legendItemsPerRow } = this.props;
    const { width } = this.state;
    const itemsPerRow = legendItemsPerRow ? legendItemsPerRow : width > 900 ? chartStyles.itemsPerRow : 2;

    return <ChartLegend data={this.getLegendData()} height={25} gutter={20} itemsPerRow={itemsPerRow} name="legend" />;
  };

  private getTooltipLabel = ({ datum }) => {
    const { formatDatumValue, formatDatumOptions } = this.props;
    const formatter = getTooltipContent(formatDatumValue);
    return datum.y !== undefined && datum.y !== null
      ? formatter(datum.y, datum.units, formatDatumOptions)
      : i18next.t('chart.no_data');
  };

  // Interactive legend

  // Hide each data series individually
  private handleLegendClick = props => {
    if (!this.state.hiddenSeries.delete(props.index)) {
      this.state.hiddenSeries.add(props.index);
    }
    this.setState({ hiddenSeries: new Set(this.state.hiddenSeries) });
  };

  // Returns true if at least one data series is available
  private isDataAvailable = () => {
    const { series } = this.state;
    const unavailable = []; // API data may not be available (e.g., on 1st of month)

    if (series) {
      series.forEach((s: any, index) => {
        if (this.isSeriesHidden(index) || (s.data && s.data.length === 0)) {
          unavailable.push(index);
        }
      });
    }
    return unavailable.length !== (series ? series.length : 0);
  };

  // Returns true if data series is hidden
  private isSeriesHidden = index => {
    const { hiddenSeries } = this.state; // Skip if already hidden
    return hiddenSeries.has(index);
  };

  // Returns groups of chart names associated with each data series
  private getChartNames = () => {
    const { series } = this.state;
    const result = [];
    if (series) {
      series.map(serie => {
        // Each group of chart names are hidden / shown together
        result.push(serie.childName);
      });
    }
    return result as any;
  };

  // Returns onMouseOver, onMouseOut, and onClick events for the interactive legend
  private getEvents = () => {
    const result = getInteractiveLegendEvents({
      chartNames: this.getChartNames(),
      isHidden: this.isSeriesHidden,
      legendName: 'legend',
      onLegendClick: this.handleLegendClick,
    });
    return result;
  };

  // Returns legend data styled per hiddenSeries
  private getLegendData = (tooltip: boolean = false) => {
    const { hiddenSeries, series } = this.state;

    if (series) {
      const result = series.map((s, index) => {
        return {
          childName: s.childName,
          ...s.legendItem, // name property
          ...(tooltip && { name: s.legendItem.tooltip }), // Override name property for tooltip
          ...getInteractiveLegendItemStyles(hiddenSeries.has(index)), // hidden styles
        };
      });
      return result;
    }
  };

  public render() {
    const {
      adjustContainerHeight,
      height,
      containerHeight = height,
      padding = {
        bottom: 130,
        left: 8,
        right: 8,
        top: 8,
      },
      title,
      xAxisLabel,
      yAxisLabel,
    } = this.props;
    const { cursorVoronoiContainer, series, width } = this.state;

    const domain = this.getDomain();
    const endDate = this.getEndDate();
    const midDate = Math.floor(endDate / 2);

    const adjustedContainerHeight = adjustContainerHeight
      ? width > 900
        ? containerHeight - 50
        : containerHeight
      : containerHeight;

    // Clone original container. See https://issues.redhat.com/browse/COST-762
    const container = cursorVoronoiContainer
      ? React.cloneElement(cursorVoronoiContainer, {
          disable: !this.isDataAvailable(),
          labelComponent: (
            <ChartLegendTooltip
              legendData={this.getLegendData(true)}
              title={datum => i18next.t('chart.day_of_month_title', { day: datum.x })}
            />
          ),
        })
      : undefined;

    return (
      <div className="chartOverride" ref={this.containerRef}>
        <Title headingLevel="h2" style={styles.title} size="xl">
          {title}
        </Title>
        <div style={{ ...styles.chart, height: adjustedContainerHeight }}>
          <div style={{ height, width }}>
            <Chart
              containerComponent={container}
              domain={domain}
              events={this.getEvents()}
              height={height}
              legendComponent={this.getLegend()}
              legendData={this.getLegendData()}
              legendPosition="bottom"
              padding={padding}
              theme={ChartTheme}
              width={width}
            >
              {series &&
                series.map((s, index) => {
                  return this.getChart(s, index);
                })}
              <ChartAxis label={xAxisLabel} style={chartStyles.xAxis} tickValues={[1, midDate, endDate]} />
              <ChartAxis dependentAxis label={yAxisLabel} style={chartStyles.yAxis} />
            </Chart>
          </div>
        </div>
      </div>
    );
  }
}

export { HistoricalUsageChart, HistoricalUsageChartProps };

import { GcpCostOverviewWidget } from './gcpCostOverviewCommon';
import { accountSummaryWidget, costWidget, regionSummaryWidget, serviceSummaryWidget } from './gcpCostOverviewWidgets';

export type GcpCostOverviewState = Readonly<{
  widgets: Record<number, GcpCostOverviewWidget>;
  currentWidgets: number[];
}>;

export const defaultState: GcpCostOverviewState = {
  currentWidgets: [costWidget.id, accountSummaryWidget.id, serviceSummaryWidget.id, regionSummaryWidget.id],
  widgets: {
    [costWidget.id]: costWidget,
    [accountSummaryWidget.id]: accountSummaryWidget,
    [serviceSummaryWidget.id]: serviceSummaryWidget,
    [regionSummaryWidget.id]: regionSummaryWidget,
  },
};

export function gcpCostOverviewReducer(state = defaultState): GcpCostOverviewState {
  return state;
}

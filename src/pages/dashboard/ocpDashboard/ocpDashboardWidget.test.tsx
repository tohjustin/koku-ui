jest
  .mock('date-fns/start_of_month')
  .mock('date-fns/get_date')
  .mock('date-fns/format')
  .mock('date-fns/get_month');

import formatDate from 'date-fns/format';
import getDate from 'date-fns/get_date';
import getMonth from 'date-fns/get_month';
import startOfMonth from 'date-fns/start_of_month';
import { OcpDashboardTab } from 'store/dashboard/ocpDashboard';
import { mockDate } from 'testUtils';
import { getIdKeyForTab } from './ocpDashboardWidget';

const getDateMock = getDate as jest.Mock;
const formatDateMock = formatDate as jest.Mock;
const startOfMonthMock = startOfMonth as jest.Mock;
const getMonthMock = getMonth as jest.Mock;

beforeEach(() => {
  mockDate();
  getDateMock.mockReturnValue(1);
  formatDateMock.mockReturnValue('formated date');
  startOfMonthMock.mockReturnValue(1);
  getMonthMock.mockReturnValue(1);
});

test('id key for dashboard tab is the tab name in singular form', () => {
  [
    OcpDashboardTab.clusters,
    OcpDashboardTab.nodes,
    OcpDashboardTab.projects,
  ].forEach(value => {
    expect(getIdKeyForTab(value)).toEqual(value.slice(0, -1));
  });

  expect(getIdKeyForTab(OcpDashboardTab.projects)).toEqual('project');
});

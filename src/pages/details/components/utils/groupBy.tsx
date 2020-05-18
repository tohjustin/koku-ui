import { Query } from 'api/queries/query';

export const getGroupById = (query: Query) => {
  const groupBys = Object.keys(query.group_by);
  return groupBys[0];
};

export const getGroupByValue = (query: Query) => {
  const groupById = getGroupById(query);
  return query.group_by[groupById];
};
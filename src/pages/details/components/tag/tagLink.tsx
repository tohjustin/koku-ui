import { TagIcon } from '@patternfly/react-icons/dist/js/icons/tag-icon';
import { getQuery, parseQuery, Query } from 'api/queries/query';
import { Tag, TagPathsType, TagType } from 'api/tags/tag';
import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { tagActions, tagSelectors } from 'store/tags';
import { getTestProps, testIds } from 'testIds';

import { styles } from './tag.styles';
import { TagModal } from './tagModal';

interface TagLinkOwnProps {
  filterBy: string | number;
  groupBy: string;
  id?: string;
  tagReportPathsType: TagPathsType;
}

interface TagLinkState {
  isOpen: boolean;
}

interface TagLinkStateProps {
  queryString?: string;
  tagReport?: Tag;
  tagReportFetchStatus?: FetchStatus;
}

interface TagLinkDispatchProps {
  fetchTag?: typeof tagActions.fetchTag;
}

type TagLinkProps = TagLinkOwnProps & TagLinkStateProps & TagLinkDispatchProps & WithTranslation;

const tagReportType = TagType.tag;

class TagLinkBase extends React.Component<TagLinkProps> {
  protected defaultState: TagLinkState = {
    isOpen: false,
  };
  public state: TagLinkState = { ...this.defaultState };

  constructor(props: TagLinkProps) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  public componentDidMount() {
    const { fetchTag, queryString, tagReportPathsType } = this.props;
    fetchTag(tagReportPathsType, tagReportType, queryString);
  }

  public componentDidUpdate(prevProps: TagLinkProps) {
    const { fetchTag, queryString, tagReportPathsType } = this.props;
    if (prevProps.queryString !== queryString) {
      fetchTag(tagReportPathsType, tagReportType, queryString);
    }
  }

  public handleClose = (isOpen: boolean) => {
    this.setState({ isOpen });
  };

  public handleOpen = event => {
    this.setState({ isOpen: true });
    event.preventDefault();
    return false;
  };

  public render() {
    const { filterBy, groupBy, id, tagReport, tagReportPathsType } = this.props;
    const { isOpen } = this.state;

    let count = 0;

    if (tagReport) {
      for (const item of tagReport.data) {
        if (item.values) {
          count += item.values.length;
        }
      }
    }

    return (
      <div style={styles.tagsContainer} id={id}>
        {Boolean(count > 0) && (
          <>
            <TagIcon />
            <a {...getTestProps(testIds.details.tag_lnk)} href="#/" onClick={this.handleOpen} style={styles.tagLink}>
              {count}
            </a>
          </>
        )}
        <TagModal
          filterBy={filterBy}
          groupBy={groupBy}
          isOpen={isOpen}
          onClose={this.handleClose}
          tagReportPathsType={tagReportPathsType}
        />
      </div>
    );
  }
}

const mapStateToProps = createMapStateToProps<TagLinkOwnProps, TagLinkStateProps>(
  (state, { filterBy, groupBy, tagReportPathsType }) => {
    const queryFromRoute = parseQuery<Query>(location.search);
    const queryString = getQuery({
      filter: {
        [groupBy]: filterBy,
        resolution: 'monthly',
        time_scope_units: 'month',
        time_scope_value: -1,
        ...(queryFromRoute.filter.account && {
          account: queryFromRoute.filter.account,
        }),
      },
    });
    const tagReport = tagSelectors.selectTag(state, tagReportPathsType, tagReportType, queryString);
    const tagReportFetchStatus = tagSelectors.selectTagFetchStatus(
      state,
      tagReportPathsType,
      tagReportType,
      queryString
    );
    return {
      filterBy,
      queryString,
      tagReport,
      tagReportFetchStatus,
    };
  }
);

const mapDispatchToProps: TagLinkDispatchProps = {
  fetchTag: tagActions.fetchTag,
};

const TagLink = withTranslation()(connect(mapStateToProps, mapDispatchToProps)(TagLinkBase));

export { TagLink, TagLinkProps };

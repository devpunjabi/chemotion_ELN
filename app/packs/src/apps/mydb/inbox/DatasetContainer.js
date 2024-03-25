import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { Button, ButtonGroup, Tooltip } from 'react-bootstrap';
import AttachmentContainer from 'src/apps/mydb/inbox/AttachmentContainer';
import { DragDropItemTypes } from 'src/utilities/DndConst';
import InboxActions from 'src/stores/alt/actions/InboxActions';
import { formatDate } from 'src/utilities/timezoneHelper';
import InboxStore from 'src/stores/alt/stores/InboxStore';

const dataSource = {
  beginDrag(props) {
    return props;
  }
};

const collectSource = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

class DatasetContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      deletingTooltip: false,
    }
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    InboxStore.listen(this.onChange);
  }

  componentWillUnmount() {
    InboxStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  attachmentCount() {
    return (this.props.dataset && this.props.dataset.attachments &&
      this.props.dataset.attachments.length) || 0;
  }

  deleteDataset() {
    if (this.attachmentCount() === 0) {
      InboxActions.deleteContainerLinkUnselected(this.props.dataset);
      InboxActions.deleteContainer(this.props.dataset);
    } else {
      this.toggleTooltip();
    }
  }

  confirmDeleteDataset() {
    InboxActions.deleteContainerLinkUnselected(this.props.dataset);
    InboxActions.deleteContainer(this.props.dataset);
    this.toggleTooltip();
  }

  confirmDeleteAttachments() {
    this.toggleTooltip();
  }

  toggleTooltip() {
    this.setState(prevState => ({ ...prevState, deletingTooltip: !prevState.deletingTooltip }));
  }

  render() {
    const { connectDragSource, sourceType, dataset, largerInbox, isSelected, onDatasetSelect, checkedIds } = this.props;
    const { inboxSize } = InboxStore.getState();

    if (sourceType === DragDropItemTypes.DATASET) {
      const { visible, deletingTooltip } = this.state;
      const attachments = dataset.attachments.map(attachment => (
        <AttachmentContainer
          key={`attach_${attachment.id}`}
          sourceType={DragDropItemTypes.DATA}
          attachment={attachment}
          largerInbox={largerInbox}
          isSelected={checkedIds.includes(attachment.id)}
          checked={isSelected}
        />
      ));
      const attCount = this.attachmentCount();
      const textStyle = {
        display: 'block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'clip',
        maxWidth: '100%',
        cursor: 'move'
      };

      if (largerInbox === true) {
        textStyle.marginTop = '6px';
        textStyle.marginBottom = '6px';
      }

      const trash = this.props.cache.length === this.props.cache.length // Set it as always show
        ? (
          <span>
            <i className="fa fa-trash-o" onClick={() => this.deleteDataset()} style={{ cursor: "pointer" }}>&nbsp;</i>
            {deletingTooltip ? (
              <Tooltip placement="bottom" className="in" id="tooltip-bottom">
                {`Delete ${attCount} attachment${attCount > 1 ? 's' : ''}?`}
                <ButtonGroup
                  style={{ marginLeft: '5px' }}
                >
                  <Button
                    bsStyle="danger"
                    bsSize="xsmall"
                    onClick={() => this.confirmDeleteDataset()}
                  >
                    Yes
                  </Button>
                  <Button
                    bsStyle="warning"
                    bsSize="xsmall"
                    onClick={() => this.toggleTooltip()}
                  >
                    No
                  </Button>
                </ButtonGroup>
              </Tooltip>
            ) : null}
          </span>
        ) : null;
      const datasetCheckbox = (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onDatasetSelect(dataset.id)}
        />
      );

      return connectDragSource(
        <div>
          <div style={textStyle}>
            {datasetCheckbox}
            &nbsp;{trash}&nbsp;
            <button
              type="button"
              className="btn-inbox"
              onClick={() => this.setState(prevState => ({ ...prevState, visible: !visible }))}
            >
              <i
                className={`fa fa-folder${visible ? '-open' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-info fa fa-arrows" style={{ marginLeft: '5px', cursor: 'pointer' }} />
              </i>
              <span style={{ marginLeft: '8px' }}>{dataset.name}</span>
            </button>
            {
              inboxSize && inboxSize !== 'Small'
              && (
                <span className="text-info" style={{ float: 'right', display: largerInbox ? '' : 'none' }}>
                  {formatDate(dataset.created_at)}
                </span>
              )
            }
          </div>
          <div>{visible ? attachments : null}</div>
        </div>,
        { dropEffect: 'move' }
      );
    }

    return null;
  }
}

export default DragSource(props => props.sourceType, dataSource, collectSource)(DatasetContainer);

DatasetContainer.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  sourceType: PropTypes.string.isRequired,
  largerInbox: PropTypes.bool,
  isSelected: PropTypes.bool.isRequired,
  onDatasetSelect: PropTypes.func.isRequired,
};

DatasetContainer.defaultProps = {
  largerInbox: false
};

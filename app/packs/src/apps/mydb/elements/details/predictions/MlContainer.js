
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Tabs, Tab } from 'react-bootstrap';
import ForwardActions from 'src/stores/alt/actions/ForwardActions';
import ForwardStore from 'src/stores/alt/stores/ForwardStore';
import UIStore from 'src/stores/alt/stores/UIStore';
import ForwardContainer from './ForwardContainer';
import SCSform from './SCSContainer';

// import Content from './Content';
import PanelHeader from 'src/components/common/PanelHeader';

import { CloseBtn, ResetBtn } from './ForwardComponent';

import RetroContainer from './RetroContainer';
import TemplateContainer from './TemplateContainer';
import ForCont from './ForCont';


class MlContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...ForwardStore.getState(),
    };
    this.onChange = this.onChange.bind(this);
    // this.onChangeUI = this.onChangeUI.bind(this);
    this.panelHeader = this.panelHeader.bind(this);
  }

  componentDidMount() {
    ForwardStore.listen(this.onChange);
    // UIStore.listen(this.onChangeUI);
    // const uiState = UIStore.getState();
    // this.onChangeUI(uiState);
  }

  // componentWillUnmount() {
  //   ForwardStore.unlisten(this.onChange);
  //   UIStore.unlisten(this.onChangeUI);
  // }

  onChange(state) {
    this.setState({ ...state });
  }

  // onChangeUI(uiState) {
  //   const combState = { uiState, predictionState: this.state };
  //   ForwardActions.updateUI.defer(combState);
  // }

  panelHeader() {
    const { prediction } = this.props;
    // const fwdState = this.state;
    const btns = [
      <CloseBtn key="closeBtn" el={prediction} />,
      <ResetBtn key="resetBtn" />,
    ];
    return <PanelHeader title="Machine learning for Chemistry" btns={btns} />;
  }

  selectTab(key) { // eslint-disable-line class-methods-use-this
    ForwardActions.updateActiveKey(key);
  }

  render() {
    
    const {
      activeKey, reactant, reagent, solvent, num_res, fwdState, outputEls
    } = this.state;

    // const els = (defaultEls && inputEls) ? [...defaultEls, ...inputEls] : [];

    return (
      <Panel
        bsStyle="default"
      >
        <Panel.Heading>{this.panelHeader()}</Panel.Heading>
        <Tabs
          activeKey={activeKey}
          onSelect={this.selectTab}
          id="askcos-tabs"
        >
          <Tab eventKey={0} title="Forward Synthesis">
            {/* <ForwardContainer
              reactant={reactant}
              reagent={reagent}
              solvent={solvent}
              num_res={num_res}
              outputEls={outputEls}
            // handleTemplateChanged={this.handleTemplateChanged}
            /> */}
            <ForCont width={100} height={100} />

          </Tab>
          <Tab className= "tab-content-wrapper" eventKey={1} title="Retro Synthesis">
            <div>
              <RetroContainer width={100} height={100} />
            </div>
          </Tab>
          <Tab className= "tab-content-wrapper" eventKey={2} title="Reaction Template">
            <div>
              <TemplateContainer width={100} height={100} />
            </div>
          </Tab>
            
          {/* <Tab eventKey={2} title="SCScore Prediction">
            <div>
              <SCSform
                inpChem='sdsd'
                outputEls='ASD' />
            </div>
          </Tab> */}
          <Tab eventKey={3} title="Impurity Prediction">
            <div>

              {/* <Serials selMolSerials={selMolSerials} template={template} /> */}
            </div>
          </Tab>
          <Tab eventKey={4} title="Buyable Lookup">
            <div>
              {/* <Appa /> */}
              {/* <Previews
                  previewObjs={previewObjs}
                  splSettings={splSettings}
                  rxnSettings={rxnSettings}
                  siRxnSettings={siRxnSettings}
                  configs={configs}
                  template={template}
                  molSerials={selMolSerials}
                  prdAtts={prdAtts}
                  attThumbNails={attThumbNails}
                /> */}
            </div>
          </Tab>
          <Tab eventKey={5} title="Site Selectivity">
            <div>
              {/* <Archives archives={archives} /> */}
            </div>
          </Tab>
        </Tabs>
      </Panel>
    );
  }
}

MlContainer.propTypes = {
  prediction: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default MlContainer;

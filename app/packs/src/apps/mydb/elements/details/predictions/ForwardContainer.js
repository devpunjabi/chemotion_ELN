import React ,  { Component } from 'react';
import Select from 'react-select';
import {
  FormGroup, OverlayTrigger, ControlLabel, FormControl, Tooltip,
  Row, Col, Button, Panel
} from 'react-bootstrap';
import {solventOpts} from './Solvents';
import ForwardActions from 'src/stores/alt/actions/ForwardActions';
// import PredOutput from './PredOutput';
import { output } from 'react-dom-factories';
import SvgFileZoomPan from 'react-svg-file-zoom-pan-latest';
import ForwardFetcher from 'src/fetchers/ForwardFetcher';
import SVG from 'react-inlinesvg';

import ForwardStore from 'src/stores/alt/stores/ForwardStore';
import PropTypes from 'prop-types';
import { ContinuousColorLegend } from 'react-vis';
import MoleculesFetcher from 'src/fetchers/MoleculesFetcher';

class ForwardContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...ForwardStore.getState(),

    };
    this.onChange = this.onChange.bind(this);
    // this.onChangeUI = this.onChangeUI.bind(this);
    // this.panelHeader = this.panelHeader.bind(this);
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


  // const Reactants = ({ reactant }) => (


  fwdthis(params, template) {
    return (dispatch) => {
        ForwardFetcher.fetchforward(params, template)
          .then((result) => {
            dispatch(result);
          }).catch((errorMessage) => {
            console.log(errorMessage);
          });
      };
    }

  create_molecule_obj(result_obj) {
      // let molobj = []; 
      Object.entries(result_obj.outcomes).forEach(([key, value]) => {

        MoleculesFetcher.fetchBySmi(value.smiles).then((result) =>{

        value['svg'] = '/images/molecules/'+result.molecule_svg_file;

        });      
      });
      
      return result_obj;
    }
    
  reactantField() {
    const { reactant } = this.props;
    return (
      <FormGroup>
        <ControlLabel>
          Reactants
        </ControlLabel>
      <FormControl
        type="text"
        value={reactant}
        onChange={ForwardActions.updateReactant}
      />
    </FormGroup>
  );
  }

  reagentField() {
    const { reagent } = this.props;
    return (
      <FormGroup>
        <ControlLabel>
          Reagents
        </ControlLabel>
      <FormControl
        type="text"
        value={reagent}
        onChange={ForwardActions.updateReagent}
      />
    </FormGroup>
  );
  }

  numField() {
    const { num_res } = this.props;
    return (
      <FormGroup>
        <ControlLabel>
          Number of Results
        </ControlLabel>
      <FormControl
        type="text"
        value={num_res}
        onChange={ForwardActions.updateNumResults}
      />
    </FormGroup>
  );
  }


//   contentBlock(outputEls){

//     const stripBStyle = idx => (idx % 2 === 0 ? 'primary' : 'info');

//     const predictions = outputEls.preds;
//     const molobjs = outputEls.molobjs;

//     return (
//     <div className="square-grid">
//     {predictions.map((el, idx) => (
//       <div key={`${idx}-${el.id}`} className="square-with-shadow">
//         <Panel bsStyle={stripBStyle(idx)}>
//           <Panel.Heading>
//             <Panel.Title>
//               Rank { el.rank }: { el.smiles } 
//               <br/>
//               Molecular weight : { el.mol_wt } 
//               <br/>
//               Score : { el.score } 
//               <br/>
//               Probability : { el.prob }
//               <br/>
//             </Panel.Title>
//           </Panel.Heading>
          
//           {/* <img src={'images/samples/0a01a59051a3962bd35ea277973b074e911d06197be01deb55c63abb13c3179835cf4039bc3a1388b0b9a094e59abdf5589494bf8f9a543affc55a9198a74ed4.svg'} width={100} height={200}/> */}
//           {/* <img src="predictions/ho.png" width = "120" height = "90" /> */}
         
//           </Panel>
//           <div className="svg-container">
//           <SvgFileZoomPan 
//             svgPath={ '/images/molecules/'+ molobjs[idx].molecule_svg_file }
//             duration={300}
//             resize
//           />
//           </div>
  
//           {/* <SVG
          
//           //   // src= {'/images/samples/0a01a59051a3962bd35ea277973b074e911d06197be01deb55c63abb13c3179835cf4039bc3a1388b0b9a094e59abdf5589494bf8f9a543affc55a9198a74ed4.svg'}
//           //   src= { '/images/molecules/'+ molobjs[idx].molecule_svg_file }
//           //   className='input-fields'
//           //   key= { '/images/molecules/'+ molobjs[idx].molecule_svg_file }
//           //   // key= {'/images/samples/0a01a59051a3962bd35ea277973b074e911d06197be01deb55c63abb13c3179835cf4039bc3a1388b0b9a094e59abdf5589494bf8f9a543affc55a9198a74ed4.svg'}
//           // /> */}
  
        
//       </div>

//       ))
//       }

//     </div>
//   );
// }


contentBlock(outputEls) {
  const stripBStyle = idx => (idx % 2 === 0 ? 'primary' : 'info');
  const predictions = outputEls.preds;
  const molobjs = outputEls.molobjs;

  

  return (
    <div className="square-grid">
      {predictions.map((el, idx) => (
        <div key={`${idx}-${el.id}`} className="square-with-shadow">
          <div className="box-content">
            <Panel bsStyle={stripBStyle(idx)}>
              <Panel.Heading>
                <Panel.Title>
                  Rank {el.rank}: {el.smiles}
                  <br />
                  Molecular weight: {el.mol_wt}
                  <br />
                  Score: {el.score}
                  <br />
                  Probability: {el.prob}
                  <br />
                </Panel.Title>
              </Panel.Heading>
            </Panel>
            <div className="svg-container">
              <SvgFileZoomPan
                svgPath={'/images/molecules/' + molobjs[idx].molecule_svg_file}
                duration={300}
                resize
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


  outputfield(outputEls) {
          return (
            <Panel bsStyle="default" defaultExpanded>
              <Panel.Heading>
                {/* <Panel.Title toggle>
                  { titleStr }
                </Panel.Title> */}
              </Panel.Heading>
              <Panel.Collapse>
                <Panel.Body>
                  <div >  
                    { this.contentBlock(outputEls) }
                  </div>
                </Panel.Body>
              </Panel.Collapse>
            </Panel>
          );
        };
  
    

  // solventField() {
  //   const solvent = this.props;
  //   const onSolventChange = (e) => {
  //     ForwardActions.updateSolvent(e.value);
  //   };

    
  //   return (
  //     <FormGroup>
  //         <label>Solvent</label>
  //         <Select
  //           options={solventOpts()}
  //           value={solvent}
  //           clearable={false}
  //           style={{ width: 200 }}
  //           onChange={onSolventChange}
  //         />
  //     </FormGroup>
  //   );
  // }

  // const Reagents = ({ reagent }) => (
  //     <FormGroup>
  //         <ControlLabel>
  //           Reagents
  //         </ControlLabel>
  //       <FormControl
  //         type="text"
  //         value={reagent}
  //         onChange={ForwardActions.updateReagent}
  //       />
  //     </FormGroup>
  //   );

  // const NumResults = ({ num_res }) => (
  //     <FormGroup>
  //         <ControlLabel>
  //           Number of Results
  //         </ControlLabel>
  //       <FormControl
  //         type="integer"
  //         value={num_res}
  //         onChange={ForwardActions.updateNumResults}
  //       />
  //     </FormGroup>
  //   );


  // const onSolventChange = (e) => {
  //     ForwardActions.updateSolvent(e.value);
  //   };

    // onSolventChange(e){
    //   ForwardActions.updateSolvent(e.value);
    // };


  // const Solvent = ({ solvent }) => (
  //     <FormGroup>
  //         <label>Solvent</label>
  //         <Select
  //           options={solventOpts()}
  //           value={solvent}
  //           clearable={false}
  //           style={{ width: 200 }}
  //           onChange={onSolventChange}
  //         />
  //     </FormGroup>
  //   );

  // const PredictBtn = ({ fwdState, template}) => {
  //     const {reactant, reagent, solvent, num_res} = fwdState;
  //     const onClick = () => {
  //       const params = {
  //         reactant: reactant,
  //         reagent: reagent, 
  //         solvent: solvent,
  //         num_res: num_res
  //       }
  //       const template = 'products'
  //       // LoadingActions.start.defer();
  //       // ForwardActions.forwardPred.defer(params, template);
  //       ForwardFetcher.fetchforward(params, template);
  //     };
  //     // const disableBtn = reactants.length === 0;
    
  //     return (
  //       <Button
  //         bsStyle="primary"
  //         bsSize="xsmall"
  //         className="button-right"
  //         // disabled={disableBtn}
  //         onClick={onClick}
  //       >
  //         <span><i className="fa fa-file-text-o" /> Predict</span>
  //       </Button>
  //     );
  //   };
    

  render() {
  const { reactant, reagent, solvent, num_res, outputEls,  fwdState } = this.state;
  console.log('opels', outputEls)
  

  const onSolventChange = (e) => {
      ForwardActions.updateSolvent(e.value);
    };

    
  const onClick = () => {
            const params = {
              reactant: reactant,
              reagent: reagent, 
              solvent: solvent,
              num_res: num_res
            }
            const template = 'products'
            // LoadingActions.start.defer();
            ForwardActions.forwardPred.defer(params, template);
            // ForwardFetcher.fetchforward(params, template)
            // .then((result) => {
            // const outputEls = this.create_molecule_obj(result).outcomes;
            // console.log('Thusu sad', outputEls);
            // this.setState( {outputEls} );

            // });
            
          };

  return(

        <div className="panel-workspace">
          <br/>
          <Row>
            <Col xs={6} lg={5}>
              {/* <reactantField reactant={reactant}/> */}
              {this.reactantField()}
            </Col>
            <Col xs={6} lg={5}>
              {/* <reagentField reagent={reagent} /> */}
              {this.reagentField()}
            </Col>
          </Row>
          <Row>
            <Col xs={6} lg={5}>
              {/* <solventField solvent={solvent}/> */}
              {/* {this.solventField()} */}
              <FormGroup>
          <label>Solvent</label>
          <Select
              options={solventOpts()}
              value={solvent}
              clearable={false}
              style={{ width: 200 }}
              onChange={onSolventChange}
            />
            </FormGroup>
            </Col>
            <Col xs={6} lg={5}>
              {/* <NumResults num_res={num_res}/> */}
              {this.numField()}
            </Col>
          </Row>
          <Button
                bsStyle="primary"
                bsSize="large"
                className="button-left"
          // disabled={disableBtn}
                onClick={onClick}
            >
          <span><i className="fa fa-file-text-o" /> Predict</span>
            </Button>
          <br/>
          <div>
          {this.outputfield(outputEls)}
          </div>

        </div>
      // );
    // } 
    
    );

  }
};

ForwardContainer.propTypes = {
  reactant: PropTypes.string.isRequired,
  reagent: PropTypes.string.isRequired,
  solvent: PropTypes.string.isRequired,
  num_res: PropTypes.string.isRequired,
  // eslint-disable-line react/forbid-prop-types
}


export default ForwardContainer;
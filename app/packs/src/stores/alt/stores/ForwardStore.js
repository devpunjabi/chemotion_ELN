import { difference, uniq } from 'lodash';

import alt from '../alt';
import ForwardActions from 'src/stores/alt/actions/ForwardActions';
import MoleculesFetcher from 'src/fetchers/MoleculesFetcher';
import { del } from 'react-dom-factories';

class ForwardStore {
  constructor() {
    this.activeKey = 0;
    this.template = {};
    this.inputEls = [];
    this.defaultEls = [];
    this.outputEls = {preds : [], molobjs : []};
    // this.molobjs= [];
    this.reactant = "";
    this.reagent = "";
    this.solvent = "";
    this.num_res = "";
    this.fwdState = [];
    

    this.bindListeners({
      handleUpdateSolvent: ForwardActions.updateSolvent,
      handleUpdateReactant: ForwardActions.updateReactant,
      handleUpdateReagent: ForwardActions.updateReagent,
      handleUpdateNumResults: ForwardActions.updateNumResults,
      handleInfer: ForwardActions.forwardPred,
      // handleMolobjs: ForwardActions.forwardPred,
      handleUpdateActiveKey: ForwardActions.updateActiveKey,
      handleUpdateTemplate: ForwardActions.updateTemplate,
      // handleUpdateUI: ForwardActions.updateUI,
      handleRemove: ForwardActions.remove,
      handleReset: ForwardActions.reset,
    });
  }

  handleUpdateSolvent(value) {
    this.setState({ solvent: value });
  }

  handleUpdateReactant(value) {
    // const validValue = this.validSmiles(value);
    this.setState({ reactant: value });

  }

  handleUpdateReagent(value) {
    // const validValue = this.validSmiles(value);
    this.setState({ reagent: value });
  }

  handleUpdateNumResults(value) {
    this.setState({ num_res: value });
  }

  // handleMolobjs(result){
  //   const molobjs = [];
  //   Object.entries(result.outcomes).forEach(([key, value]) => {

  //     MoleculesFetcher.fetchBySmi(value.smiles).then((result) =>{
  //     molobjs[key] = '/images/molecules/'+result.molecule_svg_file;

  //     }); 
    
  //   });

  //   this.setState({ molobjs });

  // }

  // async handleMolobjs(result) {


  //   const promises = result.outcomes.map((element) =>
  //         MoleculesFetcher.fetchBySmi(element.smiles)
  //       );
  //       const responses = await Promise.all(promises);

  //   // return (dispatch) => {
  //   // Object.entries(result.outcomes).forEach(([key, value]) => {

  //   //   MoleculesFetcher.fetchBySmi(value.smiles).then((result) =>{

  //   //     value['svg'] = '/images/molecules/'+result.molecule_svg_file;

  //   //   });
          
  //   // });

  //   const molobjs = responses.molecule_svg_file;

  //   this.setState({ molobjs });
  //   console.log('handleMolobjs', molobjs);
  // // }

  // }


  handleInfer(result) {

    console.log('store handle ', result);

    if (result.error) {
      this.setState({ outputEls: [] });
    }

    const outputEls = { preds: result.preds.outcomes , molobjs : result.molobjs} || [];

    // this.handleMolobjs(result); 

    this.setState({ outputEls });
    
  }

  handleUpdateActiveKey(activeKey) {
    this.setState({ activeKey });
  }

  handleUpdateTemplate(template) {
    this.setState({
      activeKey: 0,
      template,
      inputEls: [],
      defaultEls: [],
      // outputEls: [],
    });
  }

  handleUpdateUI(result) {
    if (!result) return null;

    const { samples } = result;

    if (!samples) return null;

    const defaultSmis = this.defaultEls.map(x => x.molecule.cano_smiles);

    const rspSmis = samples.map(x => x.outcomes[0].smiles);

    let uniqLoadSmis = difference(rspSmis, defaultSmis);

    uniqLoadSmis = uniq(uniqLoadSmis);

    // let inputEls = samples.filter((x, idx) => ( // avoid 2 samples with the same smiles
    //   rspSmis.indexOf(x.molecule.cano_smiles) === idx
    // ));

    // const maxNumEls = this.template === 'predictProducts' ? 10 : 1;

    inputEls = inputpredictProductsEls.map(x => ( // avoid including defaultSmis
      uniqLoadSmis.indexOf(x.molecule.cano_smiles) >= 0 ? x : null
    )).filter(r => r != null).filter((val, idx) => idx < maxNumEls);

    this.setState({ inputEls });
    return null;
  }

  handleRemove(el) {
    const inputEls = this.inputEls.filter(x => x.id !== el.id);
    this.setState({ inputEls });
  }

  handleReset() {
    this.setState({
      activeKey: 0,
      template: 'products',
      inputEls: [],
      defaultEls: [],
      // outputEls: [],
    });
  }
}

export default alt.createStore(ForwardStore, 'ForwardStore');

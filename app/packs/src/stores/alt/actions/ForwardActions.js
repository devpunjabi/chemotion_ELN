import _, { create } from 'lodash';

import alt from '../alt';
import UIFetcher from 'src/fetchers/UIFetcher';
import ForwardFetcher from 'src/fetchers/ForwardFetcher';
import SvgFetcher from 'src/fetchers/SvgFetcher'; 
import MoleculesFetcher from 'src/fetchers/MoleculesFetcher';
// import SvgFetcher from '../../../fetchers/SvgFetcher';


class ForwardActions {

    updateReactant = e => e.target.value
    updateReagent = e => e.target.value
    updateSolvent = value => value  
    updateNumResults = e => e.target.value

    // forwardPred(params, template) {
    //     return (dispatch) => {
    //         ForwardFetcher.fetchforward(params, template)
    //           .then((result) => {
    //             dispatch(result);
    //           }).catch((errorMessage) => {
    //             console.log(errorMessage);
    //           });
    //       };
    //     }

    forwardPred(params, template) {
      return (dispatch) => {
        ForwardFetcher.fetchforward(params, template)
          .then((result) => {
            const promises = result.outcomes.map((element) => {
              // Make another API call for each element of the result
              return MoleculesFetcher.fetchBySmi(element.smiles)
                .then((response) => {
                  console.log(response);
                  return response;
                })
                .catch((error) => {
                  console.error(error);
                  throw error; // Rethrow the error to be caught by Promise.all
                });
            });
            
            // Wait for all promises to resolve and dispatch the result to the store
            Promise.all(promises)
              .then((responses) => {
                console.log(result, responses);
                const combresp = {preds : result , molobjs : responses}
                dispatch(combresp);
              })
              .catch((error) => {
                console.error(error);
              });
          })
          .catch((errorMessage) => {
            console.error(errorMessage);
          });
      };
    }


    updateActiveKey(key) { // eslint-disable-line class-methods-use-this
            return key;
        }
        
    updateTemplate(template) { // eslint-disable-line class-methods-use-this
            return template;
        }
    


    // updateUI(combState) { // eslint-disable-line class-methods-use-this
    //     const { uiState, predictionState } = combState;
    //     const { sample, currentCollection } = uiState;
    //     const { inputEls, defaultEls } = predictionState;
    //     const sampleMemoryIds = inputEls ? inputEls.map(e => e.id) : [];
    //     const sampleDefaultIds = defaultEls ? defaultEls.map(e => e.id) : [];
    //     const sampleCheckedIds = sample.checkedIds.toArray();
    //     const dfSIds = _.difference(sampleCheckedIds, sampleMemoryIds)
    //       .filter(id => !sampleDefaultIds.includes(id));
    
    //     const elementAdded = dfSIds.length > 0 || sample.checkedAll;
    //     const elementSubs = _.difference(sampleMemoryIds, sampleCheckedIds).length > 0;
    //     const selectedTags = { sampleIds: [...sampleMemoryIds], reactionIds: [] };
    
    //     if (elementAdded) {
    //       return (dispatch) => {
    //         UIFetcher.loadReport(
    //           {
    //             sample, reaction: {}, currentCollection, selectedTags,
    //           },
    //           'lists',
    //         ).then((rsp) => {
    //           const newSpls = rsp.samples.filter(x => !x.in_browser_memory);
    //           const allSpls = [...newSpls, ...inputEls, ...defaultEls];
    //           const result = { samples: allSpls };
    //           dispatch(result);
    //         }).catch((errorMessage) => {
    //           console.log(errorMessage);
    //         });
    //       };
    //     } else if (elementSubs) {
    //       return (dispatch) => {
    //         const inpSpls = inputEls.filter(e => sampleCheckedIds.indexOf(e.id) >= 0);
    //         const allSpls = [...defaultEls, ...inpSpls];
    //         const result = { samples: allSpls };
    //         dispatch(result);
    //       };
    //     }
    //     return (dispatch) => {
    //       dispatch(false);
    //     };
    //   }    


    remove(el) { // eslint-disable-line class-methods-use-this
        return el;
      }
    
    reset() { // eslint-disable-line class-methods-use-this
        return null;
      }


}



export default alt.createActions(ForwardActions);
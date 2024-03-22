import React, { Component, useState} from 'react';
import {
  FormGroup, OverlayTrigger, ControlLabel, FormControl, Tooltip,
  Row, Col, Button, Panel, Popover
} from 'react-bootstrap';
import SvgFileZoomPan from 'react-svg-file-zoom-pan-latest';
import RetroFetcher from 'src/fetchers/RetroFetcher';

import PropTypes from 'prop-types';
import MoleculesFetcher from 'src/fetchers/MoleculesFetcher';
import DropTargetMolecule from './dragNdrop';
import SamplesFetcher from 'src/fetchers/SamplesFetcher';
import ReactFlow, { ReactFlowProvider, Controls, MiniMap, Background, Handle, Position, useReactFlow, useNodesState , useStoreApi} from 'reactflow';
import ButtonEdge from './ButtonEdge';
import { data, pre } from 'react-dom-factories';
import ElementActions from 'src/stores/alt/actions/ElementActions';
import SampleDetails from 'src/apps/mydb/elements/details/samples/SampleDetails';
import Sample from 'src/models/Sample';
import CollectionsFetcher from 'src/fetchers/CollectionsFetcher';
import CollectionStore from 'src/stores/alt/stores/CollectionStore';
import { Collection } from 'immutable';
import UIStore from 'src/stores/alt/stores/UIStore';

class RetroContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      target: '',
      idle: true,
      sample : {},
      newSample : {},
      selectedNode : {},
      nodes: [],
      edges:[],
      tree :{},
      showSVG: false, 
      hoveredNode: null,
      loading : false,
      treeData : { nodes: [], edges: [] },
      
      

    };

    // this.onChange = this.onChange.bind(this);


    this.handleChange = this.handleChange.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    // this.treeData = { nodes: [], edges: [] };


    // this.getprecursors = this.getprecursors.bind(this);

  }
  
  onExpand = (nodedata) => {

      
    const params = { smis : nodedata.smiles };

    const nodePos = {x: position.x, y: position.y }
      // Call the reversethis function
      this.reversethis(params)
        .then((response) => {
          // Update state with the response
          this.setState({ tree: response });
          this.generateTreeData(this.state.tree, false, nodePos);
          
        })
        .catch((error) => {
          console.log(error);
        });
  

    
  };

  // resolveOverlap(nodes) {
  //   const usedPositions = new Set();

  // // Loop through each node in the array
  // for (const node of nodes) {
  //   // Check if the position is already used
  //   while (usedPositions.has(`${node.x},${node.y}`)) {
  //     // Add 100 to both position.x and position.y to resolve the overlap
  //     node.x += 200;
      
  //   }

  //   // Add the updated position to the set of used positions
  //   usedPositions.add(`${node.x},${node.y}`);
  // }
  // }

  handleNodeExpand = () => {


    const selectedNode = this.state.selectedNode;

    if (selectedNode.type== 'custom'){
    const params = { smis : selectedNode.data.smiles };

      // Call the reversethis function
      this.reversethis(params)
        .then((response) => {
          // Update state with the response
          this.setState({ tree: response  });
          this.generateTreeData(this.state.tree, false,  selectedNode.position, selectedNode.id);
          console.log(this.state);
          
        })
        .catch((error) => {
          console.log(error);
        }); 
      }
    else if (selectedNode.type== 'reaction'){
        let tforms = selectedNode.data.tforms;
        if (tforms){
          navigator.clipboard.writeText(tforms.join('\n'));
        }
      }

    
  };

  handleMoleculeSave = () =>{

    const { currentCollection, isSync } = UIStore.getState();

    const selectedNode = this.state.selectedNode;
    const newSample = Sample.buildEmpty(currentCollection.id);


    MoleculesFetcher.fetchBySmi(selectedNode.data.smiles)
      .then((result) => {
        if (!result || result == null) {
          NotificationActions.add({
            title: 'Error on Sample creation',
            message: `Cannot create molecule with entered Smiles/CAS! [${smi}]`,
            level: 'error',
            position: 'tc'
          });
        } else {
          newSample.is_new = true;
          newSample.molfile = result.molfile;
          newSample.molecule_id = result.id;
          newSample.molecule = result;
          console.log(result);
          this.setState({
            newSample
          });
          ElementActions.createSample(newSample, true);

        }
      }).catch((errorMessage) => {
        console.log(errorMessage);
      })

  }

  handleNodeSelect = (event, node) =>{
    const selectedNode = this.state;
    this.setState({selectedNode : node})
  }



  generateRoot = (tree) => {
      const newtreeData = { nodes: [] };
      console.log(tree);
      
      const rootNode = {
        id: "root",
        type: "root",
        data: { smiles: tree.request.smiles[0],  svg: tree.request.svg },
        position: { x: 0, y: 0 },
        sourcePosition: "right",
        targetPosition: "left",
        // render: CustomNode,
      };

      newtreeData.nodes.push(rootNode);
  
      this.setState({ nodes: newtreeData.nodes});
  
  }
  

  generateTreeData = (tree, isRoot, nodePos, nodeId) => {
    const newtreeData = { nodes: [], edges: [] };

    let start_x = 0;
    let start_y = 0;

    if (!isRoot) {
    start_x = nodePos.x;
    start_y = nodePos.y;  
    }
    
  
    const horizontalSpacing = 360;
    const verticalSpacing = 300;

    const x_pos = 500;

    let child_len = 0;
    let parent_len = 0;
    Object.entries(tree.trees).forEach(([key, value]) => {
      child_len = child_len + value.children[0].children.length;
      parent_len = parent_len + value.children.length;
    });
    

    let reaction_counter = 1;
    let precursor_counter = 1;

    let start_point = -( ((parent_len ) * 300) / 2)
    console.log(start_point);

    Object.entries(tree.trees).forEach(([key, value]) => {

  
      if (value.children && value.children.length > 0) {

        value.children.forEach((child, index) => {  
          const y_pos = (reaction_counter * 300 ) + start_point;
          const reactionNode = {
            id: child.id,
            type: "reaction",
            data: { id: child.id,  smiles: child.smiles, 
                    plausibility: child.plausibility, 
                    rank: child.rank, svg: child.svg, 
                    molwt: child.rms_molwt, 
                    necessary_reagent: child.necessary_reagent, 
                    tforms: child.tforms},
            position: { x: x_pos + start_x , y: y_pos + start_y},
            sourcePosition: "right",
            targetPosition: "left",
            zIndex:isRoot ? 3 : 2,
            // render: CustomNode,
          };
          newtreeData.nodes.push(reactionNode);
          reaction_counter++;

          const reactionEdge =  
            {  id: `root_${child.id}` ,
            source: isRoot ? 'root' : nodeId,
            target: child.id,
            animated: true,
            style: { stroke: '#1e1d3a' },
          }
          newtreeData.edges.push(reactionEdge);
  
          if (child.children && child.children.length > 0) {
            let start_point = -( ((child_len) * 300) / 2)
            child.children.forEach((grandchild, grandChildIndex) => {
              const y_pos_child = (precursor_counter * 300 ) + start_point;
              console.log(start_point)

              const precursorNode = {
                id: grandchild.id,
                type: "custom",
                data: { smiles: grandchild.smiles , svg: grandchild.svg, buy: grandchild.is_buyable, buyables: grandchild.buyables},
                position: { x: x_pos + 300 +start_x , y: y_pos_child + start_y },
                sourcePosition: "right",
                targetPosition: "left",
                zIndex:0
                // render: CustomNode,
              };
  
              newtreeData.nodes.push(precursorNode);
              precursor_counter++;

              const reactionEdge =  
              {  id: `${child.id}_${grandchild.id} ` ,
              source: child.id,
              target: grandchild.id,
              animated: true,
              style: { stroke: '#1e1d3a' },
               }
              newtreeData.edges.push(reactionEdge);
                console.log(precursor_counter);
              
            });
          }
        });
      }
    });

    // const adjusted_nodes = this.resolveOverlap(newtreeData.nodes)
    // console.log('adjusted bnjsit', adjusted_nodes);

    const updatedNodes  = [...this.state.nodes, ...newtreeData.nodes];
    const updatedEdges  = [...this.state.edges, ...newtreeData.edges];
    this.setState({ idle: true, nodes: updatedNodes, edges: updatedEdges});
  };
  

  reversethis(params) {
    return RetroFetcher.fetchprecursors(params);
  }
  
  handleChange = (event) => {

    SamplesFetcher.fetchById(event.sample_id).then((sample) => {
      this.setState({ sample: sample, loading : true});

      const params = { smis : sample._molecule.cano_smiles };
      // Call the reversethis function
      this.reversethis(params)
      // RetroFetcher.fetchprecursors(params)
        .then((response) => {
          // Update state with the response
          console.log(response);
          this.setState({ tree: response , loading : false });
          this.generateRoot(this.state.tree, true);
          this.generateTreeData(this.state.tree, true);
          
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  

  handleMouseEnter(event, node) {
    // Update state to show the SVG on hover
    this.setState({ showSVG: true, hoveredNode: node });
  }

  handleMouseLeave(event, node) {
    // Update state to hide the SVG when the mouse leaves the node
    this.setState({ showSVG: false, hoveredNode: null });
  }
  


  render() {

    const { showSVG, hoveredNode } = this.state; 

    const RootNode = ( { data } ) => {
      return (
        <div style={{ border: '1px solid #ccc', padding: '10px', background: '#f0f0f0' }}>
  
        
          <div style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <img
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              src={`data:image/png;base64,${data.svg}`} alt="SVG"
            />

           <p style={ {justifyContent: 'center'} }><b>{ data.smiles }</b></p>

          
          </div>
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#555' }}
          isConnectable={true}
        />
      </div>
      );
    };


    const CustomNode = ({ data }) => {
    const borderColor = data.buy ? 'green' : 'red';

    // Extract buyables data or set it as an empty array if not available
    const buyables = data.buyables || { result: [] };
    const { result, search } = buyables;

    // Prepare buyablesInfo string if there are buyables
    let buyablesInfo = '';
    if (result.length > 0) {
      buyablesInfo = result.map((item) => `Source: ${item.source}, PPG: ${item.ppg} USD`).join('\n');
    }

    return (
      <div
        style={{ border: `2px solid ${borderColor}`, padding: '10px', background: '#f0f0f0', zIndex: '0' }}
        title={data.buy ? (buyablesInfo ? `${data.smiles} - \nBuyable\n${buyablesInfo}` : `${data.smiles} - Not Buyable`) : data.smiles}
      >
        
        <div style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <img style={{ maxWidth: '100%', maxHeight: '100%' }} src={`data:image/png;base64,${data.svg}`} alt="SVG" />
        </div>
        {/* <button className='expbutton' style={{ marginTop: '10px', alignSelf: 'center'}} onClick={() => this.handleSave(data.smiles)} >Save Molecule</button> */}
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
          // onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#555' }}
          // onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={true}
        />
      </div>
  
      )

  };

    const ReactionNode = ({ data }) => {

    
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'gray',
                position: 'relative',
                cursor: 'pointer',
                // zIndex: 2,
              }}
              onMouseEnter={(event) => this.handleMouseEnter(event, data)} // Call the new event handlers
              onMouseLeave={this.handleMouseLeave} // Call the new event handlers
            >
              <div
                style={{
                  display: showSVG ? 'none' : 'block',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  lineHeight: '50px',
                  zIndex: '2',
                }}
              >
                Rank:{data.rank}
              </div>
            </div>
          </div>
    
          {/* {showSVG && hoveredNode.id === data.id && (
            <div style={{
              position: 'absolute',
              top: '-120px',
              left: '60px',
              width: '700px',
              height: '200px',
              backgroundColor: 'white',
              border: '1px solid gray',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2, 
            }}>
            <div
              style={{ justifyContent: 'center', padding:'10px' }}
              dangerouslySetInnerHTML={{
                __html: `<div style="text-align: center;"><img src="data:image/png;base64,${data.svg}" width=600px /> <p style="font-size: larger;">Reaction Plausibility: ${data.plausibility}</p></div>`
              }}
            /> 

            </div>
          )} */}

          {showSVG && hoveredNode.id === data.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-120px',
                      left: '60px',
                      width: '700px',
                      height: '200px',
                      backgroundColor: 'white',
                      border: '1px solid gray',
                      borderRadius: '5px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ justifyContent: 'center', padding: '10px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <img src={`data:image/png;base64,${data.svg}`} width="600px" alt="Reaction SVG" />
                        <p style={{ fontSize: 'larger' }}>Reaction Plausibility: {data.plausibility}</p>
                        {data.necessary_reagent && (
                          <p style={{ fontSize: 'larger' }}>Necessary Reagent: {data.necessary_reagent}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

    
          <Handle
            type="target"
            position={Position.Left}
            style={{ background: '#555' }}
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Right}
            style={{ background: '#555' }}
            isConnectable={true}
          />
        </div>
      );
    };
    

    
    

    const nodeTypes = {
      custom: CustomNode,
      reaction: ReactionNode,
      root: RootNode,
    };
    const edgeTypes = {

      buttonedge: ButtonEdge,
    };

    const nodes = this.state.nodes;
    const edges = this.state.edges;

    const connectionLineStyle = { stroke: '#fff' };
    const snapGrid = [10,10 ];
    const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

    


    // const { width, height } = this.props;
    // State to track SVG visibility
    

    

    return (
      <div> 
        {this.state.loading && 
          <div style={{ height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img style={{ height: '100px' }} src='/images/wild_card/loading-bubbles.svg' alt="Loading..." />
          </div>
        }
        {!this.state.loading && (
        <div>
        <div className="dropzone" >
          <DropTargetMolecule onChange={this.handleChange}/>
        </div>
        <div style={{ paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={this.handleMoleculeSave}>Save Molecule</button>
            <div style={{ margin: '0 10px' }}></div>
             <button onClick={this.handleNodeExpand}>Expand Molecule</button>
        </div>

        <div style={{ height: '700px' }}>
        <ReactFlowProvider>
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          nodeTypes={nodeTypes} 
          edgeTypes={edgeTypes}
          connectionLineStyle={connectionLineStyle}
          snapToGrid={true}
          snapGrid={snapGrid}
          defaultViewport={defaultViewport}
          onNodeClick={this.handleNodeSelect}
          // onNodeDoubleClick= {this.handleDoubleNodeClick}
        // onNodeMouseLeave={(event, node) =>
        //   console.log({ name: 'onNodeMouseLeave', event, node })
        // }
        // onNodeMouseEnter={(event, node) =>
        //   console.log({ name: 'onNodeMouseEnter', event, node })
        // }
        
          fitView
        
        
        >
        <MiniMap  minZoom={0.3} />
        
        <Controls />

        <Background color="#aaa" gap={16} />

        </ReactFlow>
        </ReactFlowProvider>
        </div>
        </div>
        )
        }
      </div>
    );

  }
};

RetroContainer.propTypes = {
  // target: PropTypes.string.isRequired,
  num_res: PropTypes.string.isRequired,
  sample: PropTypes.object
  // eslint-disable-line react/forbid-prop-types
}


export default RetroContainer;
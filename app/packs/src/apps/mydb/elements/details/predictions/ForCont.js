import React, { Component, useState, useCallback} from 'react';
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
import PngFetcher from 'src/fetchers/PngFetcher';
import ReactFlow, { ReactFlowProvider, Controls, MiniMap, Background, Handle, Position, useUpdateNodeInternals, useReactFlow, useNodesState , useStoreApi, applyNodeChanges} from 'reactflow';
import ButtonEdge from './ButtonEdge';
import { data, pre } from 'react-dom-factories';
import { indexOf } from 'lodash';
// import {solventOpts} from './Solvents';
import Select from 'react-select';
import ForwardFetcher from '../../../../../fetchers/ForwardFetcher';





class ForCont extends Component {
  constructor(props) {
    super(props);
    this.state = {
      target: '',
      idle: true,
      sample : {},
      nodes: [{
        id: 'Reactant',
        type: 'input',
        data: { label: 'Reactant'},
        width: 100,
        height:200,
        position: { x: 0, y: 0 },
      },
      {
        id: 'Reagent',
        type: 'input',
        data: { label: 'Reagent' },
        position: { x: 0, y: 250 },
      },{
        id: 'Solvent',
        type: 'input',
        data: { label: 'Solvent' },
        position: { x: 0, y: 500 },
      },{
        id: 'Synthesis',
        type: 'synthesis',
        data: { label: 'synthesis' },
        position: { x: 300, y: 250 },
      }
    
    ],
      edges:[
        {
          id: 're-sy',
          source: 'Reactant',
          target: 'Synthesis',
          animated: true,
        }, 
        {
          id: 'reag-sy',
          source: 'Reagent',
          target: 'Synthesis',
          animated: true,
        }, 
        {
          id: 'sol-sy',
          source: 'Solvent',
          target: 'Synthesis',
          animated: true,
        }

      ],
      tree :{},
      showSVG: false, 
      hoveredNode: null,
      pngBackground:"",
      treeData : { nodes: [], edges: [] },
      

    };

    // this.onChange = this.onChange.bind(this);


    this.handleChange = this.handleChange.bind(this);
    // this.handleMouseEnter = this.handleMouseEnter.bind(this);
    // this.handleMouseLeave = this.handleMouseLeave.bind(this);
    // this.treeData = { nodes: [], edges: [] };


    // this.getprecursors = this.getprecursors.bind(this);

  }

  handleNodeClick = (event, node) => {

    this.setState({nodes: this.state.nodes.slice(3)})

    const params = {
      reactant: this.state.reactant.molecule.cano_smiles,
      reagent: this.state.reagent.molecule.cano_smiles, 
      solvent: this.state.solvent.molecule.cano_smiles,
      num_res: 5,
      flag : false
    }
    ForwardFetcher.fetchforward(params).then((response) => {
      // Update state with the response
      this.setState({ tree: response });
      this.generateTreeData(response.outcomes);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  generateTreeData = (outcomes) => {
    const newtreeData = { nodes: [], edges: [] };

    const x_pos = 600;

    let child_len = 0;
    let parent_len = 0;
    
    child_len = outcomes.length;
    let precursor_counter = 1;

    Object.entries(outcomes).forEach(([key, value]) => {
  
      if (outcomes && outcomes.length > 0) {
        let start_point = -( ((child_len) * 300) / 2)

          const y_pos_child = (precursor_counter * 300 ) + start_point;
          
          const outcomeNode = {
            id : `custom_${value.rank}`,
            type: "custom",
            data: { smiles: value.smiles , 
              svg: value.png, 
              buy: value.is_buyable, 
              buyables: value.buyables,
              rank: value.rank,
              prob: value.prob,

            },
            position: { x: x_pos, y: y_pos_child },
            sourcePosition: "right",
            targetPosition: "left",
            zIndex:0
            // render: CustomNode,
          };          
          newtreeData.nodes.push(outcomeNode);
          precursor_counter++;
          
          const outcomeEdge =  
          {  id: `synth_${value.rank}` ,
          source: "Synthesis",
          target: `custom_${value.rank}`,
          animated: true,
          style: { stroke: '#1e1d3a' },
        }
        newtreeData.edges.push(outcomeEdge);

          }
        });

    // const adjusted_nodes = this.resolveOverlap(newtreeData.nodes)

    const updatedNodes  = [...this.state.nodes, ...newtreeData.nodes];
    const updatedEdges  = [...this.state.edges, ...newtreeData.edges];


    this.setState({ idle: true, nodes: updatedNodes, edges: updatedEdges});
    console.log(this.state);

  };
  

  updateNodeData = (index, png, smiles) => {

    const thisNode = this.state.nodes[index];

    thisNode.data = { ...thisNode.data, png: png, smiles: smiles };

    const updatedNodes  = [...this.state.nodes, ...thisNode];

    // const newnodes = prevNodes;
    this.setState({nodes : updatedNodes});
    console.log(this.state);
  }
  
  
  
  
  handleChange = (event, data) => {

    if (data.label == 'Reactant'){
    SamplesFetcher.fetchById(event.sample_id).then((sample) => {
      const params = { smiles : sample._molecule.cano_smiles };
      PngFetcher.fetchpng(params).then((pngfile)=>{
        sample['png'] = pngfile;
        this.updateNodeData(0,pngfile, sample._molecule.cano_smiles);
      })
      
      this.setState({ reactant: sample });
      console.log(this.state);

    })};


    if (data.label == 'Reagent'){
      SamplesFetcher.fetchById(event.sample_id).then((sample) => {
        const params = { smiles : sample._molecule.cano_smiles };
        PngFetcher.fetchpng(params).then((pngfile)=>{
          sample['png'] = pngfile;
          this.updateNodeData(1,pngfile, sample._molecule.cano_smiles);
        })
        this.setState({ reagent: sample });
        console.log(this.state);
  
      })};


    if (data.label == 'Solvent'){
      SamplesFetcher.fetchById(event.sample_id).then((sample) => {
        const params = { smiles : sample._molecule.cano_smiles };
        PngFetcher.fetchpng(params).then((pngfile)=>{
          sample['png'] = pngfile;
          this.updateNodeData(2,pngfile, sample._molecule.cano_smiles);
        })
        this.setState({ solvent: sample });
        console.log(this.state);
        
      })};


    };
  

  render() {



    const InputNode = ({ data }) => {
    
      // Function to handle the drag over event and allow the drop
    
      return (
        <div style={{
          border: '1px solid #ccc',
          padding: '10px',
          background: '#f0f0f0',
          backgroundSize: 'contain',
        }}>
          <>{data.label}<br/>
          {data.smiles}<br/>
          <img style={{ maxWidth: '100%', maxHeight: '100%' }} src={`data:image/png;base64,${data.png}`} alt=""/><br/></>
          <div className='drop-field'>
          <DropTargetMolecule onChange={(event) => this.handleChange(event, data)}></DropTargetMolecule>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            style={{ background: '#555' }}
            // onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={true}
          />
        </div>
      );
    };

   

    const SynthesisNode = ( { data } ) => {
      return (
        <div style={{justifyContent: 'center', border: '1px solid #ccc', padding: '10px', background: '#f0f0f0' }}>
  
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <img
              style={{width: '50px'}}
              src="~/assets/images/chem.png" alt="chem"
            />
           <p style={ {justifyContent: 'center'} }><b>{ data.smiles }</b></p>
          
          </div>
          <div>
            <button onClick={this.handleNodeClick}>Synthesize</button>
          </div>
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
          title={
            `${data.smiles} - \nProb:${data.prob}\nRank: ${data.rank}` +
            (data.buy
              ? buyablesInfo
                ? `\nBuyable\n${buyablesInfo}`
                : '\nNot Buyable'
              : '')
          }
        >
          <div style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <img style={{ maxWidth: '100%', maxHeight: '100%' }} src={`data:image/png;base64,${data.svg}`} alt="SVG" />
          </div>
          <button className='expbutton' style={{ marginTop: '10px', alignSelf: 'center'}} >Save</button>
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
      );
    };

    
    
    

    const nodeTypes = {
      custom: CustomNode,
      input: InputNode,
      synthesis: SynthesisNode,

    };
    const edgeTypes = {

      buttonedge: ButtonEdge,
    };

    const nodes = this.state.nodes;
    const edges = this.state.edges;

    const connectionLineStyle = { stroke: '#fff' };
    const snapGrid = [10,10 ];
    const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

    return (
      <div> 
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
          // onNodeClick={this.handleNodeClick}
          // onNodesChange={this.updateNodeData}
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
    );

  }
};

ForCont.propTypes = {
  // target: PropTypes.string.isRequired,
  num_res: PropTypes.string.isRequired,
  // eslint-disable-line react/forbid-prop-types
}


export default ForCont;
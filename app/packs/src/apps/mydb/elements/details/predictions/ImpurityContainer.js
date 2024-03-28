import React, { Component } from 'react';
import ImpurityFetcher from 'src/fetchers/ImpurityFetcher';
import CeleryTaskFetcher from '../../../../../fetchers/CeleryTaskFetcher';
import { ProgressBar } from 'react-bootstrap'; // Import ProgressBar from react-bootstrap

const styles = {
    image: {
      maxWidth: '100%',
      maxHeight: '300px',
      marginBottom: '16px',
      padding: '10px'
    },
    info: {
      fontSize: '16px',
      marginBottom: '8px',
      padding: '10px'

    },
    references: {
      fontSize: '14px',
      marginBottom: '16px',
      padding: '10px'

    },
    referenceTable: {
      width: '100%',
      borderCollapse: 'collapse',

    },
    referenceHeader: {
      backgroundColor: '#f2f2f2',
      textAlign: 'left',
    },
    referenceRow: {
      borderBottom: '1px solid #ccc',
    },
    referenceCell: {
      padding: '8px',
    },
  };
class ImpurityContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reactant: '',
      reagent: '',
      product: '',
      solvent: '',
      apiResponse: null,
      taskStatus: null,
      taskMessage: '',
      prediction : [], 
    };
  }

  handleReactantChange = (event) => {
    this.setState({ reactant: event.target.value });
  };
  handleReagentChange = (event) => {
    this.setState({ reagent: event.target.value });
  };
  handleProductChange = (event) => {
    this.setState({ product: event.target.value });
  };
  handleSolventChange = (event) => {
    this.setState({ solvent: event.target.value });
  };

  pollTaskStatus = (taskId) => {
    // Polling task status
    const params = {task_id : taskId};
    const interval = setInterval(() => {

      CeleryTaskFetcher.fetchtask(params)
      .then(response => {
        // Update task status
        this.setState({ taskStatus: response.state, taskMessage: response.message });
        // Check if task is completed
        if (response.state === 'SUCCESS' || response.state === 'FAILURE') {
          console.log(response)
          this.setState({prediction : response.output.predict_expand})
          clearInterval(interval); // Stop polling
        }
      })
      .catch(error => {
        console.error('Error fetching task status:', error);
        clearInterval(interval); // Stop polling
      });
    }, 1000); // Poll every 1 second
  };


  fetchApiResponse = () => {
    // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint to fetch the response based on the template ID.
    const params = { reactants: this.state.reactant,
        reagents: this.state.reagent ,
        products: this.state.product ,
        solvent: this.state.solvent };

    ImpurityFetcher.fetchimpurity(params)
      .then((response) => {
        // Update the state with the API response data.
        this.setState({ apiResponse: response });
        this.pollTaskStatus(response.task_id)
      })
      .catch((error) => {
        console.error('Error fetching API response:', error);
      });
  };

  render() {
    const { apiResponse, taskStatus , taskMessage, prediction } = this.state;

    const columns = [
      { displayName: 'No.', keyName: 'no' },
      { displayName: 'Predicted Impuritites', keyName: 'prd_smiles' },
      { displayName: 'Possible mechanisms', keyName: 'modes_name' },
      { displayName: 'Inspector score', keyName: 'avg_insp_score' },
      { displayName: 'Similarity score', keyName: 'similarity_to_major' }


    ];

    const progressMap = {
      'Impurity prediction started.': 25,
      'Mode 1: normal prediction': 50,
      'Mode 2: over-reaction': 75,
      'Mode 3: dimerization': 95,
      'Task complete!': 100
    };

    // Get progress value based on task message
    const progress = progressMap[taskMessage] || 0;


    // Define progress bar variant and label based on task status
    let variant = 'info'; // Default variant
    let label = 'In Progress'; // Default label
    if (taskStatus === 'SUCCESS') {
      variant = 'success';
      label = 'Completed';
    } 
    else if (taskStatus === 'FAILURE') {
      variant = 'danger';
      label = 'Failed';
    }
    else if (taskMessage === 'Impurity prediction started.') {
      variant = 'info';
      label = 'In Progress';
    }
    else if (taskMessage === 'Mode 1: normal prediction') {
      variant = 'info';
      label = 'Mode 1: normal prediction';
    }
    else if (taskMessage === 'Mode 2: over-reaction') {
      variant = 'info';
      label = 'Mode 2: over-reaction';
    }
    else if (taskMessage === 'Mode 3: dimerization') {
      variant = 'info';
      label = 'Mode 3: dimerization';
    }

    return (
        <div className='container'>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={this.state.reactant}
            onChange={this.handleReactantChange}
            placeholder="Reactants"
            style={{ padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          /> 
          <input
            type="text"
            value={this.state.reagent}
            onChange={this.handleReagentChange}
            placeholder="Reagents"
            style={{ padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={this.state.product}
            onChange={this.handleProductChange}
            placeholder="Product"
            style={{ padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />  
          <input
            type="text"
            value={this.state.solvent}
            onChange={this.handleSolventChange}
            placeholder="Solvent"
            style={{ padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />  
        </div>
        <button onClick={this.fetchApiResponse} style={{ justifyContent: 'center', padding: '8px 16px', borderRadius: '4px', background: 'gray', color: '#fff', border: 'none' }}>Predict Impurities</button>
        <br></br>
        <div style={{ marginTop: '16px' }}>{apiResponse &&
        <div> 
        <ProgressBar animated now={progress} variant={variant} label={label} />
        {taskStatus === 'SUCCESS' && (
          <>
          <table style={{ borderSpacing: '10px' }}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index } style={{ padding: '10px' }}>{column.displayName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
          {prediction.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {/* {columns.map((column, colIndex) => (
                  <td key={colIndex} style={{ padding: '10px' }}>{item[column.keyName]}</td>
                ))} */}
                <td style={{ padding: '10px' }}>{item['no']}</td>
                {/* <td style={{ padding: '10px' }}>{item['prd_smiles']}</td> */}
                <td style={{ padding: '10px' }}>
                  {<img src={`data:image/png;base64,${item['svg']}`} alt="SVG"/>}
                </td>
                <td style={{ padding: '10px' }}>{item['modes_name']}</td>
                <td style={{ padding: '10px' }}>{item['avg_insp_score']}</td>
                <td style={{ padding: '10px' }}>{item['similarity_to_major']}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </>)
        }
      </div>
        
        }
        </div>

      </div>
    );
  }
}

export default ImpurityContainer;

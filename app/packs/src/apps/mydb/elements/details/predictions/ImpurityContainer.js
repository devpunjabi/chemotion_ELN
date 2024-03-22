import React, { Component } from 'react';
import ImpurityFetcher from 'src/fetchers/ImpurityFetcher';
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
      taskStatus: null
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
    const interval = setInterval(() => {
      axios.get(`celery-api-endpoint/${taskId}`)
      .then(response => {
        // Update task status
        this.setState({ taskStatus: response.state });
        // Check if task is completed
        if (response.state === 'SUCCESS' || response.state === 'FAILURE') {
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
    const { apiResponse } = this.state;

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
        
      </div>
    );
  }
}

export default ImpurityContainer;

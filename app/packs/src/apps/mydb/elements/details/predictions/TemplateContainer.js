import React, { Component } from 'react';
import TemplateFetcher from 'src/fetchers/TemplateFetcher';
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
class TemplateContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      templateId: '',
      apiResponse: null,
    };
  }

  handleTemplateIdChange = (event) => {
    this.setState({ templateId: event.target.value });
  };

  fetchApiResponse = () => {
    // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint to fetch the response based on the template ID.
    const params = { template_id: this.state.templateId };

    TemplateFetcher.fetchtemplate(params)
      .then((response) => {
        // Update the state with the API response data.
        this.setState({ apiResponse: response });
        console.log(response);
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
            value={this.state.templateId}
            onChange={this.handleTemplateIdChange}
            placeholder="Enter Template ID"
            style={{ padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button onClick={this.fetchApiResponse} style={{ justifyContent: 'center', padding: '8px 16px', borderRadius: '4px', background: 'gray', color: '#fff', border: 'none' }}>Fetch Reaction Template</button>
        </div>
        {apiResponse && (
          <>
            <img
              style={styles.image}
              src={`data:image/png;base64,${apiResponse.template.svg}`}
              alt="SVG"
            />
            <>
            Reaction Smarts: {apiResponse.template.reaction_smarts && <p style={styles.info}>{apiResponse.template.reaction_smarts}</p>}
            </>
            Template Set: {apiResponse.template.template_set && <p style={styles.info}>{apiResponse.template.template_set}</p>}
            {apiResponse.template.references && (
              <div style={styles.references}>
                <p style={styles.info}>References:</p>
                <table style={styles.referenceTable}>
                  <tbody>
                    {apiResponse.template.references.map((reference, index) => (
                      <tr key={index} style={styles.referenceRow}>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                        <td style={styles.referenceCell}>{reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default TemplateContainer;

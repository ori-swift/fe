import React, { useState, useEffect, useRef, useContext } from 'react';
import { Form, Dropdown, Button, Overlay, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './ClientSelector.css'; // You'll need to create this CSS file
import { getAllClients } from '../../../api/general_be_api';
import { AppContext } from '../../../App';

const ClientSelector = ({ value, onChange, className }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const {selectedCompany} = useContext(AppContext)

  const detailsTarget = useRef(null);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const clientsData = await getAllClients(selectedCompany.id);
        setClients(clientsData);
        setFilteredClients(clientsData);
        
        // If a value (client_id) is provided, find and set the selected client
        if (value) {
          const client = clientsData.find(c => c.id === parseInt(value));
          if (client) {
            setSelectedClient(client);
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [value]);

  // Filter clients when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const handleSelect = (clientId) => {
    const client = clients.find(c => c.id === parseInt(clientId));
    setSelectedClient(client);
    onChange(clientId); // Pass only the id to the parent component
    setSearchTerm('');
  };

  const handleShowDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <div className="client-selector-container">      
      <Dropdown className={`client-selector ${className || ''}`} drop="down" autoClose="outside">
        <Dropdown.Toggle 
          variant="light" 
          id="client-dropdown"
          className="client-selector-toggle"
          disabled={isLoading}
        >
          {isLoading ? 'טוען...' : (
            selectedClient ? (
              <div className="selected-client-display">
                <span>{selectedClient.name} (ID: {selectedClient.id})</span>
                <Button 
                  ref={detailsTarget}
                  variant="link" 
                  size="sm" 
                  className="client-info-btn"
                  onClick={handleShowDetails}
                >
                  <i className="bi bi-info-circle"></i>
                </Button>
              </div>
            ) : 'בחר לקוח'
          )}
        </Dropdown.Toggle>
        
        <Dropdown.Menu className="client-selector-menu" popperConfig={{ strategy: 'fixed' }}>
          <Form.Control
            autoFocus
            className="client-search-input mx-3 my-2"
            placeholder="חפש לקוח..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          
          <Dropdown.Divider />
          
          <div className="client-dropdown-scroll">
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <Dropdown.Item 
                  key={client.id} 
                  onClick={() => handleSelect(client.id)}
                  active={selectedClient && selectedClient.id === client.id}
                >
                  {client.name} (ID: {client.id})
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item disabled>אין תוצאות חיפוש</Dropdown.Item>
            )}
          </div>
        </Dropdown.Menu>
      </Dropdown>

      {selectedClient && (
        <Overlay
          show={showDetails}
          target={detailsTarget.current}
          placement="right"
          container={document.body} 
          containerPadding={20}
        >
          <Popover id="client-details-popover" className="client-details-popover">
            <Popover.Header as="h3">{selectedClient.name}</Popover.Header>
            <Popover.Body>
              <p><strong>ID:</strong> {selectedClient.id}</p>
              <p><strong>Provider ID:</strong> {selectedClient.provider_ec_id}</p>
              {selectedClient.emails && selectedClient.emails.length > 0 && (
                <p><strong>אימייל:</strong> {selectedClient.emails.join(', ')}</p>
              )}
              {selectedClient.phones && selectedClient.phones.length > 0 && (
                <p><strong>טלפון:</strong> {selectedClient.phones.join(', ')}</p>
              )}
              <p><strong>מסמכים פתוחים:</strong> {selectedClient.open_docs_count}</p>
              {selectedClient.contact_person_name && (
                <p><strong>איש קשר:</strong> {selectedClient.contact_person_name}</p>
              )}
              {selectedClient.company_id && (
                <p><strong>חברה:</strong> {selectedClient.company_id}</p>
              )}
              <div className="client-details-actions">
                <Link 
                  to={`/client-page/${selectedClient.id}`} 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowDetails(false)}
                >
                  פתח דף לקוח
                </Link>
              </div>
            </Popover.Body>
          </Popover>
        </Overlay>
      )}
    </div>
  );
};

export default ClientSelector;
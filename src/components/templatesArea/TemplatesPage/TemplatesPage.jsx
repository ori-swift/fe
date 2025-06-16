import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import './TemplatesPage.css';
import { AppContext } from '../../../App';
import TemplateModal from '../TemplateModal/TemplateModal';
import AddTemplateModal from '../TemplateModal/AddTemplateModal';
import { getCompanyTemplates } from '../../../api/alerts_api';

const TemplatesPage = () => {
  const { selectedCompany, refreshData } = useContext(AppContext);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    if (selectedCompany)
      getCompanyTemplates(selectedCompany.id).then(setTemplates);
  }, [selectedCompany]);

  const filteredTemplates = templates.filter(t =>
    t.template_content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    if (refreshData) refreshData();
  };

  return (
    <div className="templates-container rtl">
      {showAddModal &&
        <AddTemplateModal show={showAddModal} onHide={handleModalClose} />
      }

      {showEditModal &&
        <TemplateModal
          template={editingTemplate}
          show={showEditModal}
          onHide={handleModalClose}
        />
      }

      <div className="templates-header">
        <h2>תבניות התראות</h2>
        <Button variant="primary" onClick={handleCreate}><FaPlus /> תבנית חדשה</Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="חפש בתוכן..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr><th>מזהה</th><th>שם</th><th>נושא</th><th>תוכן</th><th></th></tr>
        </thead>
        <tbody>
          {filteredTemplates.length ? filteredTemplates.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name} - {t.method} </td>
              <td>{t.subject || '—'}</td>
              <td>{t.template_content.substring(0, 20)}{t.template_content.length > 20 && '...'}</td>
              <td>
                <Button variant="outline-primary" size="sm" onClick={() => handleEdit(t)}>
                  <FaEdit />
                </Button>
              </td>
            </tr>
          )) : <tr><td colSpan="5" className="text-center">אין תוצאות</td></tr>}
        </tbody>
      </Table>
    </div>
  );
};

export default TemplatesPage;


// // Hebrew + RTL version of TemplatesPage
// import React, { useContext, useState, useMemo, useEffect } from 'react';
// import { Table, Button, Form, InputGroup, Row, Col, Card, Badge } from 'react-bootstrap';
// import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
// import './TemplatesPage.css';
// import { AppContext } from '../../../App';
// import TemplateModal from '../TemplateModal/TemplateModal';
// import AddTemplateModal from '../TemplateModal/AddTemplateModal';
// import { getCompanyTemplates } from '../../../api/alerts_api';


// const TemplatesPage = () => {
//   const { selectedCompany, refreshData } = useContext(AppContext);
//   // Updated to work with the new flat structure
//   // const templates = selectedCompany?.alert_templates || {};
//   const [templates, setTemplates] = useState([])
//   const [filters, setFilters] = useState({ alertMethod: '', docType: '', isAggregate: '', clientId: '', documentId: '', phaseNumber: '', searchTerm: '' });
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingTemplate, setEditingTemplate] = useState(null);
//   const [key, setKey] = useState(0); // For re-render

//   useEffect(() => {
//     if (selectedCompany)
//       getCompanyTemplates(selectedCompany.id).then(setTemplates);
//   }, [selectedCompany])
//   // Force refresh when templates change
//   useEffect(() => {
//     setKey(prevKey => prevKey + 1);
//   }, [selectedCompany?.alert_templates]);

//   // Updated to work with the flat structure
//   const getUniqueValues = (field) => {
//     const values = new Set();
//     Object.values(templates || {}).forEach(t => {
//       if (t[field] !== undefined) values.add(String(t[field]))
//     });
//     return Array.from(values).sort();
//   };

//   const alertMethods = useMemo(() => getUniqueValues('alert_method'), [templates]);
//   const docTypes = useMemo(() => getUniqueValues('doc_type'), [templates]);
//   const clientIds = useMemo(() => getUniqueValues('client_id'), [templates]);
//   const documentIds = useMemo(() => getUniqueValues('document_id'), [templates]);
//   const phaseNumbers = useMemo(() => getUniqueValues('phase_number'), [templates]);

//   // Updated to work with the flat structure
//   const filteredTemplates = useMemo(() => Object.entries(templates || {}).filter(([_, t]) => {
//     if (filters.alertMethod && t.alert_method !== filters.alertMethod) return false;
//     if (filters.docType && String(t.doc_type) !== filters.docType && !(t.doc_type === null && filters.docType === 'null')) return false;
//     if (filters.clientId && String(t.client_id) !== filters.clientId && !(t.client_id === null && filters.clientId === 'null')) return false;
//     if (filters.documentId && String(t.document_id) !== filters.documentId && !(t.document_id === null && filters.documentId === 'null')) return false;
//     if (filters.phaseNumber && String(t.phase_number) !== filters.phaseNumber && !(t.phase_number === null && filters.phaseNumber === 'null')) return false;
//     if (filters.searchTerm && !t.template_content.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
//     return true;
//   }), [templates, filters]);

//   const handleFilterChange = ({ target: { name, value } }) => setFilters(prev => ({ ...prev, [name]: value }));
//   const clearFilters = () => setFilters({ alertMethod: '', docType: '', isAggregate: '', clientId: '', documentId: '', phaseNumber: '', searchTerm: '' });

//   const handleEdit = (template) => {
//     setEditingTemplate(template);
//     setShowEditModal(true);
//   };

//   const handleCreate = () => {
//     setEditingTemplate(null);
//     setShowAddModal(true);
//   };

//   const handleModalClose = () => {
//     setShowEditModal(false);
//     setShowAddModal(false);
//     // Force a data refresh after modal closes
//     if (refreshData) {
//       refreshData();
//     }
//   };

//   // Helper function to get a display name from the template key
//   const getTemplateDisplayName = (key) => {
//     // If key has format like "18____aggregate", extract the meaningful part
//     const parts = key.split('____');
//     if (parts.length > 1) {
//       return parts[1];
//     }
//     return key;
//   };

//   return (
//     <div className="templates-container rtl" key={key}>
//       {showAddModal &&
//         <AddTemplateModal
//           show={showAddModal}
//           onHide={handleModalClose}
//         />
//       }

//       {showEditModal &&
//         <TemplateModal
//           template={editingTemplate}
//           show={showEditModal}
//           onHide={handleModalClose}
//         />
//       }

//       <div className="templates-header">
//         <h2>תבניות התראות</h2>
//         <Button variant="primary" className="templates-create-btn" onClick={handleCreate}>
//           <FaPlus /> תבנית חדשה
//         </Button>
//       </div>

//       <Card className="templates-filter-card mb-4">
//         <Card.Body>
//           <Card.Title className="templates-filter-title"><FaFilter className="me-2" /> סינון תבניות</Card.Title>
//           <Row>
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>אמצעי התראה</Form.Label><Form.Select name="alertMethod" value={filters.alertMethod} onChange={handleFilterChange}><option value="">הכל</option>{alertMethods.map(v => <option key={v}>{v}</option>)}</Form.Select></Form.Group></Col>
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>סוג מסמך</Form.Label><Form.Select name="docType" value={filters.docType} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{docTypes.filter(t => t !== 'null').map(v => <option key={v}>{v}</option>)}</Form.Select></Form.Group></Col>

//           </Row>
//           <Row>
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>מזהה לקוח</Form.Label><Form.Select name="clientId" value={filters.clientId} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{clientIds.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>מזהה מסמך</Form.Label><Form.Select name="documentId" value={filters.documentId} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{documentIds.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>

//           </Row>
//           <Row>
//             <Col md={8}><Form.Group className="mb-3"><Form.Label>חיפוש בתוכן</Form.Label><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="חפש בתוכן..." /></InputGroup></Form.Group></Col>
//             <Col md={4} className="d-flex align-items-end"><Button variant="secondary" onClick={clearFilters} className="w-100">נקה סינון</Button></Col>
//           </Row>
//         </Card.Body>
//       </Card>

//       <div className="templates-section">
//         <h3 className="templates-section-title">תבניות התראה</h3>
//         <div className="templates-table-wrapper">
//           <Table striped bordered hover responsive className="templates-table">
//             <thead><tr><th>מזהה</th><th>סוג תבנית</th><th>אמצעי</th><th>סוג</th><th>לקוח</th><th>מסמך</th><th>תוכן</th><th></th></tr></thead>
//             <tbody>{filteredTemplates.length ? filteredTemplates.map(([key, t]) => (
//               <tr key={key}>
//                 <td>{t.id}</td>
//                 <td>{getTemplateDisplayName(key)}</td>
//                 <td>
//                   <Badge bg={t.alert_method === 'email' ? 'primary' : t.alert_method === 'sms' ? 'success' : 'info'}>
//                     {t.alert_method || 'כללי'}
//                   </Badge>
//                 </td>
//                 <td>{t.doc_type || 'ללא'}</td>
//                 <td>{t.client_id || 'ללא'}</td>
//                 <td>{t.document_id || 'ללא'}</td>
//                 <td>{t.template_content.substring(0, 20)}{t.template_content.length > 20 && '...'}</td>
//                 <td>
//                   <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(t)}>
//                     <FaEdit />
//                   </Button>
//                 </td>
//               </tr>
//             )) : <tr><td colSpan="10" className="text-center">אין תוצאות</td></tr>}</tbody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TemplatesPage;
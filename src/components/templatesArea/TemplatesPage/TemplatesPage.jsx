// Hebrew + RTL version of TemplatesPage
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './TemplatesPage.css';
import { AppContext } from '../../../App';
import TemplateModal from '../TemplateModal/TemplateModal';
import AddTemplateModal from '../TemplateModal/AddTemplateModal';

const TemplatesPage = () => {
  const { selectedCompany, refreshData } = useContext(AppContext);
  const templates = selectedCompany?.alert_templates || { system: {}, unique: {} };
  const [filters, setFilters] = useState({ alertMethod: '', docType: '', isAggregate: '', clientId: '', documentId: '', phaseNumber: '', searchTerm: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showSystemTemplates, setShowSystemTemplates] = useState(false);
  const [key, setKey] = useState(0); // Add this to force re-render

  // Force refresh when templates change
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [selectedCompany?.alert_templates]);

  const getUniqueValues = (field) => {
    const values = new Set();
    Object.values(templates.system || {}).forEach(t => { if (t[field]) values.add(String(t[field])) });
    Object.values(templates.unique || {}).forEach(t => { if (t[field]) values.add(String(t[field])) });
    return Array.from(values).sort();
  };

  const alertMethods = useMemo(() => getUniqueValues('alert_method'), [templates]);
  const docTypes = useMemo(() => getUniqueValues('doc_type'), [templates]);
  const clientIds = useMemo(() => getUniqueValues('client_id'), [templates]);
  const documentIds = useMemo(() => getUniqueValues('document_id'), [templates]);
  const phaseNumbers = useMemo(() => getUniqueValues('phase_number'), [templates]);

  const filteredSystemTemplates = useMemo(() => Object.entries(templates.system || {}).filter(([_, t]) => {
    if (filters.alertMethod && t.alert_method !== filters.alertMethod) return false;
    if (filters.docType && String(t.doc_type) !== filters.docType && filters.docType !== 'null') return false;
    if (filters.isAggregate && String(t.is_aggregate) !== filters.isAggregate) return false;
    if (filters.searchTerm && !t.template_content.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  }), [templates.system, filters]);

  const filteredUniqueTemplates = useMemo(() => Object.entries(templates.unique || {}).filter(([_, t]) => {
    if (filters.alertMethod && t.alert_method !== filters.alertMethod) return false;
    if (filters.docType && String(t.doc_type) !== filters.docType && !(t.doc_type === null && filters.docType === 'null')) return false;
    if (filters.isAggregate && String(t.is_aggregate) !== filters.isAggregate) return false;
    if (filters.clientId && String(t.client_id) !== filters.clientId && !(t.client_id === null && filters.clientId === 'null')) return false;
    if (filters.documentId && String(t.document_id) !== filters.documentId && !(t.document_id === null && filters.documentId === 'null')) return false;
    if (filters.phaseNumber && String(t.phase_number) !== filters.phaseNumber && !(t.phase_number === null && filters.phaseNumber === 'null')) return false;
    if (filters.searchTerm && !t.template_content.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  }), [templates.unique, filters]);

  const handleFilterChange = ({ target: { name, value } }) => setFilters(prev => ({ ...prev, [name]: value }));
  const clearFilters = () => setFilters({ alertMethod: '', docType: '', isAggregate: '', clientId: '', documentId: '', phaseNumber: '', searchTerm: '' });
  
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
    // Force a data refresh after modal closes
    if (refreshData) {
      refreshData();
    }
  };

  return (
    <div className="templates-container rtl" key={key}>
      {showAddModal && 
        <AddTemplateModal 
          show={showAddModal} 
          onHide={handleModalClose}
        />
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
        <Button variant="primary" className="templates-create-btn" onClick={handleCreate}>
          <FaPlus /> תבנית חדשה
        </Button>
      </div>

      <Card className="templates-filter-card mb-4">
        <Card.Body>
          <Card.Title className="templates-filter-title"><FaFilter className="me-2" /> סינון תבניות</Card.Title>
          <Row>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>אמצעי התראה</Form.Label><Form.Select name="alertMethod" value={filters.alertMethod} onChange={handleFilterChange}><option value="">הכל</option>{alertMethods.map(v => <option key={v}>{v}</option>)}</Form.Select></Form.Group></Col>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>סוג מסמך</Form.Label><Form.Select name="docType" value={filters.docType} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{docTypes.filter(t => t !== 'null').map(v => <option key={v}>{v}</option>)}</Form.Select></Form.Group></Col>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>מרוכז?</Form.Label><Form.Select name="isAggregate" value={filters.isAggregate} onChange={handleFilterChange}><option value="">הכל</option><option value="true">כן</option><option value="false">לא</option></Form.Select></Form.Group></Col>
          </Row>
          <Row>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>מזהה לקוח</Form.Label><Form.Select name="clientId" value={filters.clientId} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{clientIds.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>מזהה מסמך</Form.Label><Form.Select name="documentId" value={filters.documentId} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{documentIds.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>
            <Col md={4}><Form.Group className="mb-3"><Form.Label>מספר שלב</Form.Label><Form.Select name="phaseNumber" value={filters.phaseNumber} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{phaseNumbers.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>
          </Row>
          <Row>
            <Col md={8}><Form.Group className="mb-3"><Form.Label>חיפוש בתוכן</Form.Label><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="חפש בתוכן..." /></InputGroup></Form.Group></Col>
            <Col md={4} className="d-flex align-items-end"><Button variant="secondary" onClick={clearFilters} className="w-100">נקה סינון</Button></Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="templates-section">
        <h3 className="templates-section-title">תבניות מותאמות</h3>
        <div className="templates-table-wrapper">
          <Table striped bordered hover responsive className="templates-table">
            <thead><tr><th>מזהה</th><th>אמצעי</th><th>סוג</th><th>לקוח</th><th>מסמך</th><th>שלב</th><th>מרוכז</th><th>תוכן</th><th></th></tr></thead>
            <tbody>{filteredUniqueTemplates.length ? filteredUniqueTemplates.map(([_, t]) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>
                  <Badge bg={t.alert_method === 'email' ? 'primary' : t.alert_method === 'sms' ? 'success' : 'info'}>{t.alert_method}
                  </Badge></td><td>{t.doc_type || 'ללא'}</td>
                <td>{t.client_id || 'ללא'}</td>
                <td>{t.document_id || 'ללא'}</td>
                <td>{t.phase_number || 'ללא'}</td><td>{t.is_aggregate ? 'כן' : 'לא'}</td>
                <td>{t.template_content.substring(0, 80)}{t.template_content.length > 80 && '...'}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(t)}><FaEdit />
                  </Button>
                </td>
              </tr>
            )) : <tr><td colSpan="9" className="text-center">אין תוצאות</td></tr>}</tbody>
          </Table>
        </div>
      </div>

      <div className="templates-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="templates-section-title">תבניות מערכת</h3>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowSystemTemplates(!showSystemTemplates)}
          >
            {showSystemTemplates ? 'סגור' : 'הצג'}
          </Button>
        </div>

        {showSystemTemplates && (
          <div className="templates-table-wrapper">
            <Table striped bordered hover responsive className="templates-table">
              <thead>
                <tr>
                  <th>מזהה</th>
                  <th>אמצעי</th>
                  <th>סוג</th>
                  <th>מרוכז</th>
                  <th>תוכן</th>
                </tr>
              </thead>
              <tbody>
                {filteredSystemTemplates.length ? (
                  filteredSystemTemplates.map(([_, t]) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>
                        <Badge bg={t.alert_method === 'email' ? 'primary' : t.alert_method === 'sms' ? 'success' : 'info'}>
                          {t.alert_method}
                        </Badge>
                      </td>
                      <td>{t.doc_type || 'ללא'}</td>
                      <td>{t.is_aggregate ? 'כן' : 'לא'}</td>
                      <td>{t.template_content.substring(0, 100)}{t.template_content.length > 100 && '...'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center">אין תוצאות</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
// // Hebrew + RTL version of TemplatesPage
// import React, { useContext, useState, useMemo } from 'react';
// import { Table, Button, Form, InputGroup, Row, Col, Card, Badge } from 'react-bootstrap';
// import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
// import './TemplatesPage.css';
// import { AppContext } from '../../../App';
// import TemplateModal from '../TemplateModal/TemplateModal';
// import AddTemplateModal from '../TemplateModal/AddTemplateModal';

// const TemplatesPage = () => {
//   const { selectedCompany } = useContext(AppContext);
//   const templates = selectedCompany?.alert_templates || { system: {}, unique: {} };
//   const [filters, setFilters] = useState({ alertMethod: '', docType: '', isAggregate: '', clientId: '', documentId: '', phaseNumber: '', searchTerm: '' });
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingTemplate, setEditingTemplate] = useState(null);

//   const [showSystemTemplates, setShowSystemTemplates] = useState(false);
//   const getUniqueValues = (field) => {


//     const values = new Set();
//     Object.values(templates.system || {}).forEach(t => { if (t[field]) values.add(String(t[field])) });
//     Object.values(templates.unique || {}).forEach(t => { if (t[field]) values.add(String(t[field])) });
//     return Array.from(values).sort();
//   };

//   const alertMethods = useMemo(() => getUniqueValues('alert_method'), [templates]);
//   const docTypes = useMemo(() => getUniqueValues('doc_type'), [templates]);
//   const clientIds = useMemo(() => getUniqueValues('client_id'), [templates]);
//   const documentIds = useMemo(() => getUniqueValues('document_id'), [templates]);
//   const phaseNumbers = useMemo(() => getUniqueValues('phase_number'), [templates]);

//   const filteredSystemTemplates = useMemo(() => Object.entries(templates.system || {}).filter(([_, t]) => {
//     if (filters.alertMethod && t.alert_method !== filters.alertMethod) return false;
//     if (filters.docType && String(t.doc_type) !== filters.docType && filters.docType !== 'null') return false;
//     if (filters.isAggregate && String(t.is_aggregate) !== filters.isAggregate) return false;
//     if (filters.searchTerm && !t.template_content.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
//     return true;
//   }), [templates.system, filters]);

//   const filteredUniqueTemplates = useMemo(() => Object.entries(templates.unique || {}).filter(([_, t]) => {
//     if (filters.alertMethod && t.alert_method !== filters.alertMethod) return false;
//     if (filters.docType && String(t.doc_type) !== filters.docType && !(t.doc_type === null && filters.docType === 'null')) return false;
//     if (filters.isAggregate && String(t.is_aggregate) !== filters.isAggregate) return false;
//     if (filters.clientId && String(t.client_id) !== filters.clientId && !(t.client_id === null && filters.clientId === 'null')) return false;
//     if (filters.documentId && String(t.document_id) !== filters.documentId && !(t.document_id === null && filters.documentId === 'null')) return false;
//     if (filters.phaseNumber && String(t.phase_number) !== filters.phaseNumber && !(t.phase_number === null && filters.phaseNumber === 'null')) return false;
//     if (filters.searchTerm && !t.template_content.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
//     return true;
//   }), [templates.unique, filters]);

//   const handleFilterChange = ({ target: { name, value } }) => setFilters(prev => ({ ...prev, [name]: value }));
//   const clearFilters = () => setFilters({ alertMethod: '', docType: '', isAggregate: '', clientId: '', documentId: '', phaseNumber: '', searchTerm: '' });
//   const handleEdit = (template) => {
//     setEditingTemplate(template);
//     setShowEditModal(true);
//   };
//   const handleCreate = () => { 
//     setEditingTemplate(null); 
//     setShowEditModal(true); 
//     setShowAddModal(true);
    
//   };

//   if (showAddModal){
//     return <AddTemplateModal show={showAddModal} onHide={()=>{setShowAddModal(false)}}/>
//   }

//   if (showEditModal){
//     // show, onHide, template
//     return <TemplateModal template={editingTemplate} show={showEditModal} onHide={()=>{setShowEditModal(false)}}/>
//   }

//   return (
//     <div className="templates-container rtl">
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
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>מרוכז?</Form.Label><Form.Select name="isAggregate" value={filters.isAggregate} onChange={handleFilterChange}><option value="">הכל</option><option value="true">כן</option><option value="false">לא</option></Form.Select></Form.Group></Col>
//           </Row>
//           <Row>
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>מזהה לקוח</Form.Label><Form.Select name="clientId" value={filters.clientId} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{clientIds.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>מזהה מסמך</Form.Label><Form.Select name="documentId" value={filters.documentId} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{documentIds.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>
//             <Col md={4}><Form.Group className="mb-3"><Form.Label>מספר שלב</Form.Label><Form.Select name="phaseNumber" value={filters.phaseNumber} onChange={handleFilterChange}><option value="">הכל</option><option value="null">ללא</option>{phaseNumbers.filter(i => i !== 'null').map(i => <option key={i}>{i}</option>)}</Form.Select></Form.Group></Col>
//           </Row>
//           <Row>
//             <Col md={8}><Form.Group className="mb-3"><Form.Label>חיפוש בתוכן</Form.Label><InputGroup><InputGroup.Text><FaSearch /></InputGroup.Text><Form.Control type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="חפש בתוכן..." /></InputGroup></Form.Group></Col>
//             <Col md={4} className="d-flex align-items-end"><Button variant="secondary" onClick={clearFilters} className="w-100">נקה סינון</Button></Col>
//           </Row>
//         </Card.Body>
//       </Card>




//       <div className="templates-section">
//         <h3 className="templates-section-title">תבניות מותאמות</h3>
//         <div className="templates-table-wrapper">
//           <Table striped bordered hover responsive className="templates-table">
//             <thead><tr><th>מזהה</th><th>אמצעי</th><th>סוג</th><th>לקוח</th><th>מסמך</th><th>שלב</th><th>מרוכז</th><th>תוכן</th><th></th></tr></thead>
//             <tbody>{filteredUniqueTemplates.length ? filteredUniqueTemplates.map(([_, t]) => (
//               <tr key={t.id}>
//                 <td>{t.id}</td>
//                 <td>
//                   <Badge bg={t.alert_method === 'email' ? 'primary' : t.alert_method === 'sms' ? 'success' : 'info'}>{t.alert_method}
//                   </Badge></td><td>{t.doc_type || 'ללא'}</td>
//                 <td>{t.client_id || 'ללא'}</td>
//                 <td>{t.document_id || 'ללא'}</td>
//                 <td>{t.phase_number || 'ללא'}</td><td>{t.is_aggregate ? 'כן' : 'לא'}</td>
//                 <td>{t.template_content.substring(0, 80)}{t.template_content.length > 80 && '...'}</td>
//                 <td>
//                   <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(t)}><FaEdit />
//                   </Button>

//                 </td>
//               </tr>
//             )) : <tr><td colSpan="9" className="text-center">אין תוצאות</td></tr>}</tbody>
//           </Table>
//         </div>
//       </div>

//       <div className="templates-section">
//         <div className="d-flex justify-content-between align-items-center mb-2">
//           <h3 className="templates-section-title">תבניות מערכת</h3>
//           <Button
//             variant="outline-secondary"
//             size="sm"
//             onClick={() => setShowSystemTemplates(!showSystemTemplates)}
//           >
//             {showSystemTemplates ? 'סגור' : 'הצג'}
//           </Button>
//         </div>

//         {showSystemTemplates && (
//           <div className="templates-table-wrapper">
//             <Table striped bordered hover responsive className="templates-table">
//               <thead>
//                 <tr>
//                   <th>מזהה</th>
//                   <th>אמצעי</th>
//                   <th>סוג</th>
//                   <th>מרוכז</th>
//                   <th>תוכן</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredSystemTemplates.length ? (
//                   filteredSystemTemplates.map(([_, t]) => (
//                     <tr key={t.id}>
//                       <td>{t.id}</td>
//                       <td>
//                         <Badge bg={t.alert_method === 'email' ? 'primary' : t.alert_method === 'sms' ? 'success' : 'info'}>
//                           {t.alert_method}
//                         </Badge>
//                       </td>
//                       <td>{t.doc_type || 'ללא'}</td>
//                       <td>{t.is_aggregate ? 'כן' : 'לא'}</td>
//                       <td>{t.template_content.substring(0, 100)}{t.template_content.length > 100 && '...'}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr><td colSpan="5" className="text-center">אין תוצאות</td></tr>
//                 )}
//               </tbody>
//             </Table>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// };

// export default TemplatesPage;

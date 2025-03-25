import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import "./DocumentModal.css"

// Document Modal Component
const DocumentModal = ({ document, show, handleClose, handleCreatePlaybook }) => {
  if (!document) {
    return null    
  };
  console.log(document);
  

  // Currency symbols mapping
  const currencySymbols = {
    'ILS': '₪',
    'USD': '$',
    'EUR': '€'
  };

  console.log(document);
  
  // Get currency symbol
  const getCurrencySymbol = (doc) => {
    if (doc.currency && currencySymbols[doc.currency]) {
      return currencySymbols[doc.currency];
    }
    return '₪'; // Default to ILS
  };

  return (
    <Modal show={show} onHide={handleClose} dir="rtl" size="lg">
      <Modal.Header closeButton className="doc-modal-header">
        <Modal.Title className="doc-modal-title">פרטי מסמך</Modal.Title>
      </Modal.Header>
      <Modal.Body className="doc-modal-body">
        <div className="doc-modal-content">
          <div className="doc-modal-row">
            <span className="doc-modal-label">מספר מזהה:</span>
            <span className="doc-modal-value">{document.id}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">מספר מסמך של הספק:</span>
            <span className="doc-modal-value">{document.provider_doc_id}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">לקוח:</span>
            <span className="doc-modal-value">{document.client?.name}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">איש קשר:</span>
            <span className="doc-modal-value">{document.client?.contact_person_name || "-"}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">אימייל:</span>
            <span className="doc-modal-value">{document.client?.emails?.join(', ') || "-"}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">טלפון:</span>
            <span className="doc-modal-value">{document.client?.phones?.join(', ') || "-"}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">תיאור:</span>
            <span className="doc-modal-value">{document.description}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">הערות:</span>
            <span className="doc-modal-value">{document.remarks}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">תאריך:</span>
            <span className="doc-modal-value">{document.document_date}</span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">סכום:</span>
            <span className="doc-modal-value">
              {document.amount} {getCurrencySymbol(document)}
            </span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">סכום פתוח:</span>
            <span className="doc-modal-value">
              {document.amount_opened} {getCurrencySymbol(document)}
            </span>
          </div>
          <div className="doc-modal-row">
            <span className="doc-modal-label">סטטוס:</span>
            <span className="doc-modal-value">
              {document.is_open ? "פתוח" : "סגור"}
            </span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="doc-modal-footer">
        <Button 
          className="doc-modal-playbook-btn" 
          variant="success" 
          onClick={handleCreatePlaybook}
        >
          עדכן פלייבוק
        </Button>
        <Button 
          className="doc-modal-close-btn" 
          variant="secondary" 
          onClick={handleClose}
        >
          סגור
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DocumentModal
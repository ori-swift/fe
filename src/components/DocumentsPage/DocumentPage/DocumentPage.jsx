import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DocumentPage.css';
import { getDocumentById } from '../../../api/general_be_api';

const DocumentPage = ({ documentArg }) => {
    
    const [document, setDocument] = useState(documentArg)

    const {id} = useParams();
    const nav = useNavigate();

    useEffect(()=>{
        if (!documentArg){
            if (!id){
                alert("can't find which doc to load")
                nav("/home")
            }
            else {
                // fetch doc by id
                console.log(id);
                
                getDocumentById(id).then((res)=>{
                    setDocument(res)
                })
            }
        }
    }, [])

  if (!document) {
    return <div className="document-page-loading">טוען...</div>;
  }

  // Currency symbols mapping
  const currencySymbols = {
    'ILS': '₪',
    'USD': '$',
    'EUR': '€'
  };
  
  // Get currency symbol
  const getCurrencySymbol = (doc) => {
    if (doc.currency && currencySymbols[doc.currency]) {
      return currencySymbols[doc.currency];
    }
    return '₪'; // Default to ILS
  };

  // Handle client navigation
  const handleClientNav = () => {
    if (document.client && document.client.id) {
      nav(`/clients/${document.client.id}`);
    }
  };

  // Handle watch playbook
  const handleWatchPlaybook = () => {
    if (document.playbook && document.playbook.id) {
      nav(`/playbook/${document.playbook.id}`);
    }
  };

  // Handle create unique playbook
  const handleCreatePlaybook = () => {
    // alert("לא מיושם");
    nav("/add-playbook")
  };

  // Determine playbook level badge
  const getPlaybookLevelBadge = () => {
    if (!document.playbook) return null;
    
    let badgeClass = "";
    let badgeText = "";
    
    switch (document.playbook.type) {
      case 'document':
        badgeClass = "document-page-badge-document";
        badgeText = "פלייבוק ייחודי למסמך";
        break;
      case 'client':
        badgeClass = "document-page-badge-client";
        badgeText = "פלייבוק ברמת לקוח";
        break;
      case 'company':
        badgeClass = "document-page-badge-company";
        badgeText = "פלייבוק ברמת חברה";
        break;
      default:
        return null;
    }
    
    return <span className={`document-page-badge ${badgeClass}`}>{badgeText}</span>;
  };

  return (
    <div className="document-page-container">
      <div className="document-page-header">
        <h1 className="document-page-title">פרטי מסמך</h1>
        <div className="document-page-id">מספר מזהה: {document.id}</div>
      </div>

      <div className="document-page-content">
        <div className="document-page-section">
          <h2 className="document-page-section-title">מידע כללי</h2>
          <div className="document-page-info-grid">
            <div className="document-page-info-item">
              <div className="document-page-label">מספר מסמך של הספק</div>
              <div className="document-page-value">{document.provider_doc_id}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">תאריך</div>
              <div className="document-page-value">{document.document_date}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">סכום</div>
              <div className="document-page-value">{document.amount} {getCurrencySymbol(document)}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">סכום פתוח</div>
              <div className="document-page-value">{document.amount_opened} {getCurrencySymbol(document)}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">סטטוס</div>
              <div className="document-page-value">
                <span className={`document-page-status ${document.is_open ? "document-page-status-open" : "document-page-status-closed"}`}>
                  {document.is_open ? "פתוח" : "סגור"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="document-page-section">
          <h2 className="document-page-section-title">פרטי לקוח</h2>
          <div className="document-page-info-grid">
            <div className="document-page-info-item document-page-info-item-client">
              <div className="document-page-label">שם לקוח</div>
              <div className="document-page-value document-page-client-link" onClick={handleClientNav}>
                {document.client?.name}
                <span className="document-page-link-icon">&#8592;</span>
              </div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">איש קשר</div>
              <div className="document-page-value">{document.client?.contact_person_name || "-"}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">דוא״ל</div>
              <div className="document-page-value">{document.client?.emails?.join(', ') || "-"}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">טלפון</div>
              <div className="document-page-value">{document.client?.phones?.join(', ') || "-"}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">חברה</div>
              <div className="document-page-value">{document.client?.company || "-"}</div>
            </div>
            <div className="document-page-info-item">
              <div className="document-page-label">מסמכים פתוחים</div>
              <div className="document-page-value">{document.client?.open_docs_count || 0}</div>
            </div>
          </div>
        </div>

        <div className="document-page-section">
          <h2 className="document-page-section-title">פרטים נוספים</h2>
          <div className="document-page-info-grid">
            <div className="document-page-info-item document-page-info-item-wide">
              <div className="document-page-label">תיאור</div>
              <div className="document-page-value">{document.description || "-"}</div>
            </div>
            <div className="document-page-info-item document-page-info-item-wide">
              <div className="document-page-label">הערות</div>
              <div className="document-page-value">{document.remarks || "-"}</div>
            </div>
          </div>
        </div>

        <div className="document-page-section document-page-playbook-section">
          <h2 className="document-page-section-title">פלייבוק</h2>
          <div className="document-page-playbook-info">
            {document.playbook ? (
              <>
                <div className="document-page-playbook-header">
                  <div className="document-page-playbook-id">מזהה פלייבוק: {document.playbook.id}</div>
                  {getPlaybookLevelBadge()}
                </div>
                <div className="document-page-playbook-actions">
                  <button 
                    className="document-page-button document-page-button-view" 
                    onClick={handleWatchPlaybook}
                  >
                    צפה בפלייבוק
                  </button>
                  {document.playbook.type !== 'document' && (
                    <button 
                      className="document-page-button document-page-button-create" 
                      onClick={handleCreatePlaybook}
                    >
                      יצירת פלייבוק ייחודי
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="document-page-playbook-empty">
                <p>אין פלייבוק מקושר למסמך זה</p>
                <button 
                  className="document-page-button document-page-button-create" 
                  onClick={handleCreatePlaybook}
                >
                  יצירת פלייבוק
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
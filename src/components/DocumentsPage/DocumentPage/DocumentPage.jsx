import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './DocumentPage.css';
import { AppContext } from '../../../App';
import { getDocumentById, updateDocument } from '../../../api/documents_api';
import { getPlaybook, getPlaybooks } from '../../../api/playbook_api';
import DocumentPdfViewer from '../../DocumentPdfViewer/DocumentPdfViewer';

const DocumentPage = ({ documentArg }) => {

  const [document, setDocument] = useState(documentArg)
  const [playbook, setPlaybook] = useState(null);
  const [playbooks, setPlaybooks] = useState([]);

  const { selectedCompany } = useContext(AppContext);
  const nav = useNavigate();

  const { docId } = useParams();


useEffect(() => {
  if (selectedCompany?.id) {
    getPlaybooks(selectedCompany.id)
      .then(setPlaybooks)
      .catch(console.error);
  }
}, [selectedCompany?.id]);


  useEffect(() => {
    if (document?.playbook) {
      getPlaybook(document.playbook).then(setPlaybook).catch(console.error);
    }
  }, [document?.playbook]);


  useEffect(() => {
    if (!documentArg) {
      if (!docId) {
        alert("can't find which doc to load")
        nav("/home")
      }
      else {

        getDocumentById(docId, selectedCompany?.id).then((res) => {
          console.log(res);

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
      nav(`/client-page/${document.client.id}`);
    }
  };

  // Handle watch playbook
  const handleWatchPlaybook = () => {
    if (document.playbook && document.playbook.id) {
      nav(`/playbook/${document.playbook.id}`);
    }
  };

  return (
    <div className="document-page-container">
      <div className="document-page-header">
        <h1 className="document-page-title">פרטי מסמך</h1>
        <div className="document-page-id">מספר מזהה: {document.id}</div>
      </div>

    <div>
    <DocumentPdfViewer docId={document?.id}/>
    </div>

      <div className="document-page-info-item">
        <div className="document-page-label">{document.run_alerts ? "התראות פעילות" : "התראות כבויות"}</div>
        <div className="document-page-value">
          <input
            type="checkbox"
            checked={document.run_alerts}
            onChange={async () => {
              const newValue = !document.run_alerts;
              try {
                await updateDocument(document.id, {runAlerts: newValue});
                setDocument({ ...document, run_alerts: newValue });
              } catch (e) {
                console.error(e);
                alert("שגיאה בעדכון סטטוס ההתראות");
              }
            }}
          />
        </div>
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
              <div className="document-page-label">סוג מסמך</div>
              <div className="document-page-value">
                {document.doc_type === "proforma" ? "דרישת תשלום" :
                  document.doc_type === "tax_invoice" ? "חשבונית מס" : document.doc_type || "-"}
              </div>
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
       
      </div>
    </div>
  );
};

export default DocumentPage;
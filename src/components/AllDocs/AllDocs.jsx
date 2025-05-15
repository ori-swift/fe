import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { fetchDocumentsByCompany } from '../../api/documents_api';

import "./AllDocs.css"

// Helper functions
const getDocumentStatus = (dueDate, isOpen) => {
  if (!isOpen) return { text: "סגור", class: "doc-status-closed" };

  const today = new Date();
  const due = new Date(dueDate);
  const daysDifference = Math.floor((due - today) / (1000 * 60 * 60 * 24));

  if (daysDifference < -30) {
    return { text: "חריגה חמורה", class: "doc-status-severe-overdue" };
  } else if (daysDifference < 0) {
    return { text: "חריגה", class: "doc-status-overdue" };
  } else {
    return { text: "פתוח", class: "doc-status-open" };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(amount);
};

const AllDocs = () => {
  // State variables
  const [companyId, setCompanyId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 10,
    nextUrl: null,
    prevUrl: null
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { selectedCompany } = useContext(AppContext);

  // Filter state - consolidated into a single object
  const [filters, setFilters] = useState({
    client_name: '',
    is_open: '',
    status_open: '',
    status_due: '',
    status_severe_due: '',
    date_from: '',
    date_to: '',
    amount_gt: '',
    amount_lt: '',
    amount_opened_gt: '',
    amount_opened_lt: ''
  });

  // Initialize company ID from context
  useEffect(() => {
    if (selectedCompany?.id) {
      setCompanyId(selectedCompany.id);
    }
  }, [selectedCompany]);

  // Load documents when pagination or company changes
  useEffect(() => {
    if (companyId) {
      loadDocuments();
    }
  }, [companyId, pagination.currentPage, pagination.pageSize]);

  // Main data loading function
  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Convert all status filters to server-compatible format
      const apiFilters = { ...filters };
      
      // If status filters are selected, convert them to a status parameter the API understands
      const statusFilters = [];
      if (filters.status_open === 'true') statusFilters.push('open');
      if (filters.status_due === 'true') statusFilters.push('overdue');
      if (filters.status_severe_due === 'true') statusFilters.push('severe_overdue');
      
      // Only add the status parameter if at least one status filter is selected
      if (statusFilters.length > 0) {
        apiFilters.status = statusFilters.join(',');
      }
      
      // Handle is_open filter properly - convert string 'true' to boolean true for API
      if (apiFilters.is_open === 'true') {
        apiFilters.is_open = true;
      } else if (apiFilters.is_open === '') {
        // Remove empty is_open parameter so it doesn't affect the API query
        delete apiFilters.is_open;
      }
      
      // Clean up filters that shouldn't be sent to API
      delete apiFilters.status_open;
      delete apiFilters.status_due;
      delete apiFilters.status_severe_due;

      const response = await fetchDocumentsByCompany(
        companyId,
        pagination.currentPage,
        pagination.pageSize,
        apiFilters
      );

      setDocuments(response.results);
      
      // Update pagination state with data from the API response
      setPagination(prev => ({
        ...prev,
        totalCount: response.count,
        totalPages: Math.ceil(response.count / pagination.pageSize),
        nextUrl: response.next,
        prevUrl: response.previous
      }));
      
      setError(null);
    } catch (error) {
      setError("נכשל בטעינת מסמכים. אנא נסה שוב.");
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (pagination.nextUrl) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const goToPrevPage = () => {
    if (pagination.prevUrl) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const goToFirstPage = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const goToLastPage = () => {
    setPagination(prev => ({ ...prev, currentPage: prev.totalPages }));
  };

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    // Note: We no longer trigger search on change
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: checked ? 'true' : ''
    }));
    // Note: We no longer trigger search on change
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadDocuments();
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = Number(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      pageSize: newPageSize,
      currentPage: 1 // Reset to first page when changing page size
    }));
  };

  const resetFilters = () => {
    setFilters({
      client_name: '',
      is_open: '',
      status_open: '',
      status_due: '',
      status_severe_due: '',
      date_from: '',
      date_to: '',
      amount_gt: '',
      amount_lt: '',
      amount_opened_gt: '',
      amount_opened_lt: ''
    });
    // Reset to first page and trigger search
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadDocuments();
  };

  // Helper for checking if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };

  // Navigate to document detail
  const viewDocument = (docId) => {
    navigate(`/document/${docId}`);
  };

  return (
    <div className="doc-container" dir="rtl">
      <div className="doc-header">
        <h1 className="doc-title">מסמכי החברה</h1>
        
        <div className="doc-filter-controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`doc-button ${hasActiveFilters() ? 'doc-button-active' : ''}`}
          >
            {showFilters ? 'הסתר סינון' : 'הצג סינון'}
            {hasActiveFilters() && <span className="doc-filter-badge"></span>}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="doc-filter-panel">
          <h2 className="doc-section-title">סינון</h2>
          
          <form onSubmit={handleSearch} className="doc-filter-form">
            <div className="doc-filter-grid">
              {/* Client name filter */}
              <div className="doc-filter-group">
                <label htmlFor="client_name">שם הלקוח</label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={filters.client_name}
                  onChange={handleFilterChange}
                  placeholder="חפש לפי שם לקוח"
                  className="doc-input"
                />
              </div>

              {/* Open/Closed filter */}
              <div className="doc-filter-group">
                <label>סטטוס מסמך</label>
                <div className="doc-checkbox-item">
                  <input
                    type="checkbox"
                    id="is_open"
                    name="is_open"
                    checked={filters.is_open === 'true'}
                    onChange={handleCheckboxChange}
                    className="doc-checkbox"
                  />
                  <label htmlFor="is_open" className="doc-checkbox-label">מסמכים פתוחים בלבד</label>
                </div>
              </div>

              {/* Payment status filter */}
              <div className="doc-filter-group">
                <label>סטטוס תשלום</label>
                <div className="doc-checkbox-group">
                  <div className="doc-checkbox-item">
                    <input
                      type="checkbox"
                      id="status_open"
                      name="status_open"
                      checked={filters.status_open === 'true'}
                      onChange={handleCheckboxChange}
                      className="doc-checkbox"
                    />
                    <label htmlFor="status_open" className="doc-checkbox-label">פתוח</label>
                  </div>
                  
                  <div className="doc-checkbox-item">
                    <input
                      type="checkbox"
                      id="status_due"
                      name="status_due"
                      checked={filters.status_due === 'true'}
                      onChange={handleCheckboxChange}
                      className="doc-checkbox"
                    />
                    <label htmlFor="status_due" className="doc-checkbox-label">חריגה</label>
                  </div>
                  
                  <div className="doc-checkbox-item">
                    <input
                      type="checkbox"
                      id="status_severe_due"
                      name="status_severe_due"
                      checked={filters.status_severe_due === 'true'}
                      onChange={handleCheckboxChange}
                      className="doc-checkbox"
                    />
                    <label htmlFor="status_severe_due" className="doc-checkbox-label">חריגה חמורה</label>
                  </div>
                </div>
              </div>

              {/* Date range filter */}
              <div className="doc-filter-group">
                <label>תאריך מסמך</label>
                <div className="doc-date-range">
                  <input
                    type="date"
                    name="date_from"
                    value={filters.date_from}
                    onChange={handleFilterChange}
                    className="doc-input doc-date-input"
                    placeholder="מתאריך"
                  />
                  <span className="doc-range-separator">עד</span>
                  <input
                    type="date"
                    name="date_to"
                    value={filters.date_to}
                    onChange={handleFilterChange}
                    className="doc-input doc-date-input"
                    placeholder="לתאריך"
                  />
                </div>
              </div>

              {/* Amount range filter */}
              <div className="doc-filter-group">
                <label>סכום</label>
                <div className="doc-range-inputs">
                  <input
                    type="number"
                    name="amount_gt"
                    value={filters.amount_gt}
                    onChange={handleFilterChange}
                    placeholder="מינימום"
                    className="doc-input doc-range-input"
                  />
                  <span className="doc-range-separator">עד</span>
                  <input
                    type="number"
                    name="amount_lt"
                    value={filters.amount_lt}
                    onChange={handleFilterChange}
                    placeholder="מקסימום"
                    className="doc-input doc-range-input"
                  />
                </div>
              </div>

              {/* Open amount range filter */}
              <div className="doc-filter-group">
                <label>סכום פתוח</label>
                <div className="doc-range-inputs">
                  <input
                    type="number"
                    name="amount_opened_gt"
                    value={filters.amount_opened_gt}
                    onChange={handleFilterChange}
                    placeholder="מינימום"
                    className="doc-input doc-range-input"
                  />
                  <span className="doc-range-separator">עד</span>
                  <input
                    type="number"
                    name="amount_opened_lt"
                    value={filters.amount_opened_lt}
                    onChange={handleFilterChange}
                    placeholder="מקסימום"
                    className="doc-input doc-range-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="doc-filter-actions">
              <button type="submit" className="doc-button doc-button-primary">
                חפש
              </button>
              <button 
                type="button" 
                onClick={resetFilters} 
                className="doc-button doc-button-outline"
              >
                נקה סינון
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results area */}
      <div className="doc-results">
        {/* Loading and error states */}
        {loading && <div className="doc-loading">טוען מסמכים...</div>}
        
        {error && <div className="doc-error">{error}</div>}
        
        {!loading && !error && documents.length === 0 && (
          <div className="doc-empty">לא נמצאו מסמכים. נסה לשנות את הסינון.</div>
        )}

        {/* Results table */}
        {!loading && !error && documents.length > 0 && (
          <>
            <div className="doc-results-header">
              <span className="doc-results-count">
                מציג {documents.length} מתוך {pagination.totalCount} מסמכים
              </span>
              
              <div className="doc-page-size">
                <label htmlFor="pageSize">פריטים בעמוד:</label>
                <select
                  id="pageSize"
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  className="doc-select"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="doc-table-wrapper">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>לקוח</th>
                    <th>תאריך תשלום</th>
                    <th>סוג מסמך</th>
                    <th>סטטוס</th>
                    <th>סכום</th>
                    <th>+ מעמ</th>
                    <th>סכום פתוח</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr
                      key={doc.id}
                      onClick={() => viewDocument(doc.id)}
                      className={`doc-row ${doc.is_open ? "doc-row-open" : ""}`}
                    >
                      <td>{doc.client.name}</td>
                      <td>{formatDate(doc.due_date)}</td>
                      <td>
                        {doc.doc_type === 'tax_invoice' ? "חשבונית מס" : "דרישת תשלום"}
                      </td>
                      <td>
                        {(() => {
                          const status = getDocumentStatus(doc.due_date, doc.is_open);
                          return (
                            <span className={`doc-status ${status.class}`}>
                              {status.text}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="doc-amount">{formatCurrency(doc.amount)}</td>
                      <td className="doc-amount">{formatCurrency(doc.amount * (1+Number(doc.vat_rate)))}</td>
                      <td className="doc-amount">{formatCurrency(doc.amount_opened)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="doc-pagination">
              <button
                onClick={goToFirstPage}
                disabled={pagination.currentPage === 1}
                className="doc-pagination-button"
                aria-label="עמוד ראשון"
              >
                &raquo;
              </button>
              
              <button
                onClick={goToPrevPage}
                disabled={!pagination.prevUrl}
                className="doc-pagination-button"
                aria-label="עמוד קודם"
              >
                &rsaquo;
              </button>
              
              <div className="doc-pagination-info">
                עמוד {pagination.currentPage} מתוך {pagination.totalPages || 1}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={!pagination.nextUrl}
                className="doc-pagination-button"
                aria-label="עמוד הבא"
              >
                &lsaquo;
              </button>
              
              <button
                onClick={goToLastPage}
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                className="doc-pagination-button"
                aria-label="עמוד אחרון"
              >
                &laquo;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllDocs;
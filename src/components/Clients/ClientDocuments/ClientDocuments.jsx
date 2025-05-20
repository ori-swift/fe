import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDocumentsByClient } from '../../../api/documents_api';
import "./ClientDocuments.css";

const ClientDocuments = ({ clientId }) => {
    const [documents, setDocuments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 10;
    
    const nav = useNavigate();

    useEffect(() => {
        if (!clientId) return;
        
        setIsLoading(true);
        fetchDocumentsByClient(clientId)
            .then((docs) => {                
                
                setDocuments(docs);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching documents:", error);
                setIsLoading(false);
            });
    }, [clientId]);

    // Currency helper functions
    const currencySymbols = { 'ILS': '₪', 'USD': '$', 'EUR': '€' };
    const getCurrencySymbol = (doc) => currencySymbols[doc.currency] || '₪';
    
    // Calculate days passed since the document date
    const calculateDaysPassed = (dateString) => {
        if (!dateString) return 0;
        
        const documentDate = new Date(dateString);
        const today = new Date();
        
        // Reset time part for accurate day calculation
        documentDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const timeDiff = today - documentDate;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        return daysDiff;
    };
    
    // Function to determine status display based on calculated days passed
    const getStatusDisplay = (doc) => {
        if (!doc.is_open) {
            return <span className="status-closed">סגור</span>;
        }
        
        const daysPassed = calculateDaysPassed(doc.due_date);
        
        if (daysPassed <= 0) {
            return <span className="status-ok">פתוח</span>;
        } else if (daysPassed > 0 && daysPassed <= 30) {
            return <span className="status-overdue-orange">באיחור</span>;
        } else {
            return <span className="status-overdue-red">באיחור חמור</span>;
        }
    };

    // Filter documents based on search term and status filter
    const filteredDocuments = documents.filter((doc) => {
        if (filterStatus !== 'all') {
            if (doc.is_open !== (filterStatus === 'open')) return false;
        }
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                doc.description?.toLowerCase().includes(s) ||
                doc.remarks?.toLowerCase().includes(s) ||
                doc.provider_doc_id?.toLowerCase().includes(s) ||
                doc.doc_type?.toLowerCase().includes(s)
            );
        }
        return true;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Format date helper
    const formatDate = (d) => {
        if (!d) return "-";
        const [year, month, day] = d.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="client-documents-container" dir="rtl">
            <div className="client-documents-header">
                <h2 className="client-documents-title">רשימת מסמכים</h2>
            </div>

            <div className="client-documents-controls">
                <input
                    type="text"
                    placeholder="חפש..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="client-documents-search-input"
                />
                <label className="client-documents-filter-label">סטטוס:</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="client-documents-filter-select"
                >
                    <option value="all">הכל</option>
                    <option value="open">פתוח</option>
                    <option value="closed">סגור</option>
                </select>
            </div>

            {isLoading ? (
                <div className="client-documents-loading">
                    <div className="client-documents-spinner"></div>
                    <span>טוען מסמכים...</span>
                </div>
            ) : (
                <>
                    <div className="client-documents-table-container">
                        <table className="client-documents-table">
                            <thead>
                                <tr>
                                    <th>מספר</th>
                                    <th>תיאור</th>
                                    <th>תאריך</th>
                                    <th>מועד תשלום</th>
                                    <th>סכום</th>
                                    <th>סטטוס</th>                            
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((doc) => (
                                        <tr 
                                            key={doc.id} 
                                            onClick={() => nav("/document/" + doc.id)} 
                                            className="client-documents-table-row"
                                        >
                                            <td>{doc.id}</td>
                                            <td>{doc.doc_type}</td>
                                            <td>{formatDate(doc.document_date)}</td>
                                            <td>{formatDate(doc.due_date)}</td>
                                            <td>{doc.amount} {getCurrencySymbol(doc)}</td>
                                            <td className="client-documents-status-cell">
                                                {getStatusDisplay(doc)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="client-documents-no-results">
                                            לא נמצאו מסמכים
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="client-documents-pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="client-documents-pagination-btn"
                            >
                                הקודם
                            </button>
                            <div className="client-documents-pagination-numbers">
                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => paginate(index + 1)}
                                        className={`client-documents-pagination-number ${
                                            currentPage === index + 1 ? 'client-documents-pagination-active' : ''
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="client-documents-pagination-btn"
                            >
                                הבא
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ClientDocuments;
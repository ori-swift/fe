import React, { useContext, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import DocumentModal from './DocumentModal/DocumentModal';
import { AppContext } from '../../App';
import "./DocumentsPage.css"
import { fetchDocumentsByClient } from '../../api/documents_api';

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');    
    const [openDropdownId, setOpenDropdownId] = useState(null); // Track which row's dropdown is open
    
    
    const toggleDropdown = (e, docId) => {
        e.stopPropagation();
        setOpenDropdownId((prev) => (prev === docId ? null : docId)); // Toggle specific row
    };
    const itemsPerPage = 10;

    const { selectedClient } = useContext(AppContext);
    const nav = useNavigate();

    useEffect(() => {
        if (!selectedClient.name) {
            alert("no selected client");
            nav("/home");
            return;
        }
        fetchDocumentsByClient(selectedClient.id).then((docs) => {
            setDocuments(docs);
        });
    }, []);

    const currencySymbols = { 'ILS': '₪', 'USD': '$', 'EUR': '€' };
    const getCurrencySymbol = (doc) => currencySymbols[doc.currency] || '₪';

    const handleOpenModal = (doc) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };
    const handleCloseModal = () => setShowModal(false);
    
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
    
    // New function to determine status display based on calculated days passed
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

    const filteredDocuments = documents.filter((doc) => {
        if (filterStatus !== 'all') {
            if (doc.is_open !== (filterStatus === 'open')) return false;
        }
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                doc.client?.name?.toLowerCase().includes(s) ||
                doc.description?.toLowerCase().includes(s) ||
                doc.remarks?.toLowerCase().includes(s) ||
                doc.provider_doc_id?.toLowerCase().includes(s)
            );
        }
        return true;
    });

    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const formatDate = (d) => {
        if (!d) return "-";
        const [year, month, day] = d.split('-');
        return `${day}/${month}/${year}`;
    };

    console.log(openDropdownId);
    // console.log(doc.id);
    
    return (
        <div className="documents-page-container" dir="rtl">
            <h1 className="documents-page-title">רשימת מסמכים פתוחים של {selectedClient.name}</h1>

            <div className="documents-page-controls">
                <input
                    type="text"
                    placeholder="חפש..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="documents-page-search-input"
                />
                <label className="documents-page-filter-label">סטטוס:</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="documents-page-filter-select"
                >
                    <option value="all">הכל</option>
                    <option value="open">פתוח</option>
                    <option value="closed">סגור</option>
                </select>
            </div>

            <div className="documents-page-table-container">
                <table className="documents-page-table">
                    <thead>
                        <tr>
                            <th>מספר</th>
                            <th>לקוח</th>
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
                                // <tr key={doc.id} onClick={() => handleOpenModal(doc)} className="documents-page-table-row">
                                <tr key={doc.id} onClick={() => nav("/document/"+doc.id)} className="documents-page-table-row">
                                    <td>{doc.id}</td>
                                    <td>{doc.client?.name}</td>
                                    <td>{doc.doc_type}</td>
                                    <td>{formatDate(doc.document_date)}</td>
                                    <td>{formatDate(doc.due_date)}</td>
                                    <td>{doc.amount} {getCurrencySymbol(doc)}</td>
                                    <td className="documents-page-status-cell">{getStatusDisplay(doc)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="documents-page-no-results">לא נמצאו מסמכים</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="documents-page-pagination">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="documents-page-pagination-btn"
                    >
                        הקודם
                    </button>
                    <div className="documents-page-pagination-numbers">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`documents-page-pagination-number ${currentPage === index + 1 ? 'documents-page-pagination-active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="documents-page-pagination-btn"
                    >
                        הבא
                    </button>
                </div>
            )}

            <DocumentModal
                document={selectedDoc}
                show={showModal}
                handleClose={handleCloseModal}
            />
        </div>
    );
};

export default DocumentsPage;
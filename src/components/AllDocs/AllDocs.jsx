import React, { useState, useEffect, useContext } from 'react';

import './AllDocs.css';
import { fetchDocumentsByCompany } from '../../api/playbook_api';
import { AppContext } from '../../App';
import { useNavigate } from 'react-router-dom';

const AllDocs = () => {
    // State variables
    const [companyId, SetCompanyId] = useState();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

    const nav = useNavigate();
    const { selectedCompany } = useContext(AppContext)

    // Filter states
    const [filters, setFilters] = useState({
        client_name: '',
        is_open: '',
        date_from: '',
        date_to: '',
        amount_gt: '',
        amount_lt: '',
        amount: '',
        amount_opened_gt: '',
        amount_opened_lt: '',
        amount_opened: ''
    });


    useEffect(() => {
        SetCompanyId(selectedCompany?.id)
    }, [selectedCompany]);

    useEffect(() => {
        if (companyId)
            loadDocuments();

    }, [companyId, currentPage, pageSize, filters]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetchDocumentsByCompany(
                companyId,
                currentPage,
                pageSize,
                filters
            );

            setDocuments(response.results);
            setTotalCount(response.count);
            setTotalPages(Math.ceil(response.count / pageSize));
            setError(null);
        } catch (error) {
            setError("נכשל בטעינת מסמכים. אנא נסה שוב.");
            console.error("Error loading documents:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
        // Reset to first page when filters change
        setCurrentPage(1);
    };

    // Handle checkbox filter (is_open)
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: checked ? 'true' : ''
        }));
        setCurrentPage(1);
    };

    // Handle page size change
    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            client_name: '',
            is_open: '',
            date_from: '',
            date_to: '',
            amount_gt: '',
            amount_lt: '',
            amount: '',
            amount_opened_gt: '',
            amount_opened_lt: '',
            amount_opened: ''
        });
        setCurrentPage(1);
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Handle pagination
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    };

    // Format currency for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
        }).format(amount);
    };

    // Check if any filters are active
    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value !== '');
    };

    return (
        <div className="all-docs-container" dir="rtl">
            <h1 className="all-docs-title">מסמכי החברה</h1>

            {/* Filters toggle and active filters indicator */}
            <div className="all-docs-filters-header">
                <button
                    onClick={toggleFilters}
                    className="all-docs-button all-docs-filter-toggle"
                >
                    {showFilters ? 'הסתר סינון' : 'הצג סינון'}
                    {hasActiveFilters() && <span className="all-docs-filter-badge"></span>}
                </button>
                {hasActiveFilters() && (
                    <button onClick={resetFilters} className="all-docs-button all-docs-reset-button">
                        נקה סינון
                    </button>
                )}
            </div>

            {/* Filters section - collapsible */}
            {showFilters && (
                <div className="all-docs-filters-container">
                    <h2 className="all-docs-section-title">סינון</h2>
                    <div className="all-docs-filters-grid">
                        <div className="all-docs-filter-group">
                            <label htmlFor="client_name">שם הלקוח</label>
                            <input
                                type="text"
                                id="client_name"
                                name="client_name"
                                value={filters.client_name}
                                onChange={handleFilterChange}
                                placeholder="חפש לפי שם לקוח"
                                className="all-docs-input"
                            />
                        </div>

                        <div className="all-docs-filter-group">
                            <label htmlFor="is_open">סטטוס</label>
                            <div className="all-docs-checkbox-container">
                                <input
                                    type="checkbox"
                                    id="is_open"
                                    name="is_open"
                                    checked={filters.is_open === 'true'}
                                    onChange={handleCheckboxChange}
                                    className="all-docs-checkbox"
                                />
                                <label htmlFor="is_open" className="all-docs-checkbox-label">מסמכים פתוחים בלבד</label>
                            </div>
                        </div>

                        <div className="all-docs-filter-group">
                            <label>תאריך מסמך</label>
                            <div className="all-docs-date-range">
                                <input
                                    type="date"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                    placeholder="מתאריך"
                                    className="all-docs-input all-docs-date-input"
                                />
                                <span className="all-docs-date-separator">עד</span>
                                <input
                                    type="date"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                    placeholder="לתאריך"
                                    className="all-docs-input all-docs-date-input"
                                />
                            </div>
                        </div>
                        <br />
                        <div className="all-docs-filter-group">
                            <label>סכום</label>
                            <div className="all-docs-range-inputs">
                                <input
                                    type="number"
                                    name="amount_gt"
                                    value={filters.amount_gt}
                                    onChange={handleFilterChange}
                                    placeholder="מינימום"
                                    className="all-docs-input all-docs-range-input"
                                />
                                <span className="all-docs-range-separator">עד</span>
                                <input
                                    type="number"
                                    name="amount_lt"
                                    value={filters.amount_lt}
                                    onChange={handleFilterChange}
                                    placeholder="מקסימום"
                                    className="all-docs-input all-docs-range-input"
                                />
                            </div>
                        </div>
                        <br />
                        <div className="all-docs-filter-group">
                            <label>סכום פתוח</label>
                            <div className="all-docs-range-inputs">
                                <input
                                    type="number"
                                    name="amount_opened_gt"
                                    value={filters.amount_opened_gt}
                                    onChange={handleFilterChange}
                                    placeholder="מינימום"
                                    className="all-docs-input all-docs-range-input"
                                />
                                <span className="all-docs-range-separator">עד</span>
                                <input
                                    type="number"
                                    name="amount_opened_lt"
                                    value={filters.amount_opened_lt}
                                    onChange={handleFilterChange}
                                    placeholder="מקסימום"
                                    className="all-docs-input all-docs-range-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Documents table */}
            <div className="all-docs-table-container">
                {loading && <div className="all-docs-loading">טוען מסמכים...</div>}

                {error && <div className="all-docs-error">{error}</div>}

                {!loading && !error && documents.length === 0 && (
                    <div className="all-docs-empty">לא נמצאו מסמכים. נסה לשנות את הסינון.</div>
                )}

                {!loading && !error && documents.length > 0 && (
                    <>
                        <div className="all-docs-table-header">
                            <span>מציג {documents.length} מתוך {totalCount} מסמכים</span>
                            <div className="all-docs-page-size">
                                <label htmlFor="pageSize">פריטים בעמוד:</label>
                                <select
                                    id="pageSize"
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    className="all-docs-select"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>

                        <table className="all-docs-table">
                            <thead>
                                <tr>
                                    <th>מזהה</th>
                                    <th>לקוח</th>
                                    <th>מזהה מסמך</th>
                                    <th>תאריך</th>
                                    <th>תיאור</th>
                                    <th>סטטוס</th>
                                    <th>סכום</th>
                                    <th>סכום פתוח</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map(doc => (
                                    <tr 
                                    onClick={()=>{nav("/document/" + doc.id)}}
                                    key={doc.id} className={doc.is_open ? "all-docs-row-open" : ""}>
                                        <td>{doc.id}</td>
                                        <td>{doc.client.name}</td>
                                        <td>{doc.provider_doc_id}</td>
                                        <td>{formatDate(doc.document_date)}</td>
                                        <td className="all-docs-description">{doc.description || "-"}</td>
                                        <td>
                                            <span className={`all-docs-status ${doc.is_open ? "all-docs-status-open" : "all-docs-status-closed"}`}>
                                                {doc.is_open ? "פתוח" : "סגור"}
                                            </span>
                                        </td>
                                        <td className="all-docs-amount">{formatCurrency(doc.amount)}</td>
                                        <td className="all-docs-amount">{formatCurrency(doc.amount_opened)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination controls */}
                        <div className="all-docs-pagination">
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="all-docs-pagination-button"
                            >
                                &laquo;
                            </button>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="all-docs-pagination-button"
                            >
                                &lsaquo;
                            </button>

                            <div className="all-docs-pagination-info">
                                עמוד {currentPage} מתוך {totalPages}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="all-docs-pagination-button"
                            >
                                &rsaquo;
                            </button>
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="all-docs-pagination-button"
                            >
                                &raquo;
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AllDocs;
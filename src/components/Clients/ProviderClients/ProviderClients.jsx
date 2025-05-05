import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClients } from '../../../api/general_be_api';
import './ProviderClients.css';
import { AppContext } from '../../../App';

const ProviderClients = ({ ps }) => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 15;

    const [filters, setFilters] = useState({
        hasOpenDocs: false,
        hasRunAlerts: false,
        sortBy: 'name'
    });

    const { setSelectedClient } = useContext(AppContext);
    const nav = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        getAllClients(ps.id).then(res => {
            console.log("All clients:");
            console.log(res);
            
            
            const normalizePhones = p =>
                Array.isArray(p) && p.length && typeof p[0] === 'string'
                    ? p.map(num => ({ number: num, has_whatsapp: false }))
                    : p || [];

            setClients(res.map(c => ({ ...c, phones: normalizePhones(c.phones) })));
            setIsLoading(false);
        });
    }, [ps.id]);

    const handleClientClick = (client) => {
        setSelectedClient(client);
        nav("/client-page/" + client.id);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ hasOpenDocs: false, hasRunAlerts: false, sortBy: 'name' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    const getStatusDisplay = (overdueValue) => {
        if (overdueValue === 0) {
            return <span className="status-ok">תקין</span>;
        } else if (overdueValue > 0 && overdueValue <= 30) {
            return <span className="status-overdue-orange">באיחור</span>;
        } else {
            return <span className="status-overdue-red">באיחור</span>;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('he-IL', { 
            style: 'currency', 
            currency: 'ILS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredClients = clients
        .filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!filters.hasOpenDocs || (client.open_docs_count && client.open_docs_count > 0)) &&
            (!filters.hasRunAlerts || client.run_alerts === true)
        )
        .sort((a, b) => {
            if (filters.sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                const aCount = a.open_docs_count || 0;
                const bCount = b.open_docs_count || 0;
                return bCount - aCount;
            }
        });

    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

    const clientsWithOpenDocs = clients.filter(c => c.open_docs_count > 0).length;
    const clientsWithRunAlerts = clients.filter(c => c.run_alerts === true).length;

    const handlePageChange = (pageNumber, e) => {
        e.stopPropagation();
        setCurrentPage(pageNumber);
    };

    return (
        <div className="clients-list-container">
            <div className="clients-list-header-container">
                <h2 className="clients-list-title">לקוחות של {ps.company_name}</h2>
            </div>

            <div className="clients-list-content">
                <div className="clients-list-search-wrapper">
                    <input
                        type="text"
                        className="clients-list-search"
                        placeholder="חיפוש לפי שם..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div className="clients-list-search-icon"></div>
                </div>

                <div className="clients-list-filters">
                    <div className="clients-list-filter-group">
                        <label className="clients-list-filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.hasOpenDocs}
                                onChange={(e) => handleFilterChange('hasOpenDocs', e.target.checked)}
                            />
                            <span className="clients-list-filter-text">הצג רק לקוחות עם מסמכים פתוחים</span>
                            <span className="clients-list-badge">{clientsWithOpenDocs}</span>
                        </label>
                    </div>

                    <div className="clients-list-filter-group">
                        <label className="clients-list-filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.hasRunAlerts}
                                onChange={(e) => handleFilterChange('hasRunAlerts', e.target.checked)}
                            />
                            <span className="clients-list-filter-text">התראות פעילות</span>
                            <span className="clients-list-badge">{clientsWithRunAlerts}</span>
                        </label>
                    </div>

                    <div className="clients-list-filter-group">
                        <span className="clients-list-filter-label">מיון לפי:</span>
                        <div className="clients-list-filter-options">
                            <label className="clients-list-filter-radio">
                                <input
                                    type="radio"
                                    name="sortBy"
                                    checked={filters.sortBy === 'name'}
                                    onChange={() => handleFilterChange('sortBy', 'name')}
                                />
                                <span className="clients-list-filter-text">שם</span>
                            </label>
                            <label className="clients-list-filter-radio">
                                <input
                                    type="radio"
                                    name="sortBy"
                                    checked={filters.sortBy === 'openDocs'}
                                    onChange={() => handleFilterChange('sortBy', 'openDocs')}
                                />
                                <span className="clients-list-filter-text">מסמכים פתוחים</span>
                            </label>
                        </div>
                    </div>

                    <button
                        className="clients-list-clear-filters"
                        onClick={clearFilters}
                        disabled={!searchTerm && !filters.hasOpenDocs && !filters.hasRunAlerts && filters.sortBy === 'name'}
                    >
                        נקה סינון
                    </button>
                </div>

                {isLoading ? (
                    <div className="clients-list-loading">
                        <div className="clients-list-spinner"></div>
                        <span>טוען לקוחות...</span>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="clients-list-empty">לא נמצאו לקוחות מתאימים</div>
                ) : (
                    <>
                        <div className="clients-list-table-container">
                            <table className="clients-list-table">
                                <thead>
                                    <tr>
                                        <th className="clients-list-header">שם</th>
                                        <th className="clients-list-header">אימייל</th>
                                        <th className="clients-list-header">סטטוס</th>
                                        <th className="clients-list-header">סכום פתוח</th>
                                        <th className="clients-list-header">מסמכים פתוחים</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentClients.map((client) => (
                                        <tr
                                            key={client.id}
                                            onClick={() => handleClientClick(client)}
                                            className="clients-list-row"
                                        >
                                            <td className="clients-list-cell clients-list-name-cell">
                                                {client.name}
                                                {client.run_alerts && (
                                                    <span className="clients-list-alert-icon" title="התראות פעילות"></span>
                                                )}
                                            </td>
                                            <td className="clients-list-cell clients-list-email-cell">
                                                {client.emails?.[0] && (
                                                    <div className="clients-list-contact">
                                                        <span className="clients-list-email-icon"></span>
                                                        <span className="clients-list-info">{client.emails[0]}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="clients-list-cell clients-list-status-cell">
                                                {getStatusDisplay(client.is_overdue)}
                                            </td>
                                            <td className="clients-list-cell clients-list-amount-cell">
                                                {formatCurrency(client.total_open_amount || 0)}
                                            </td>
                                            <td className="clients-list-cell clients-list-docs-cell">
                                                {client.open_docs_count > 0 ? (
                                                    <span className="clients-list-docs-badge">{client.open_docs_count}</span>
                                                ) : (
                                                    <span className="clients-list-no-docs">0</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="clients-list-pagination">
                                <button
                                    className="clients-list-pagination-button clients-list-pagination-prev"
                                    onClick={(e) => handlePageChange(currentPage - 1, e)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="clients-list-pagination-prev-icon"></span>
                                </button>

                                <div className="clients-list-pagination-info">
                                    עמוד {currentPage} מתוך {totalPages}
                                </div>

                                <button
                                    className="clients-list-pagination-button clients-list-pagination-next"
                                    onClick={(e) => handlePageChange(currentPage + 1, e)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="clients-list-pagination-next-icon"></span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProviderClients;
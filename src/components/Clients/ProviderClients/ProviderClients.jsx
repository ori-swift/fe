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

    // Updated filters with run_alerts
    const [filters, setFilters] = useState({
        hasOpenDocs: false,
        hasRunAlerts: false,
        sortBy: 'name' // 'name' or 'openDocs'
    });

    const { setSelectedClient } = useContext(AppContext);
    const nav = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        getAllClients(ps.id).then((res) => {
            setClients(res);
            setIsLoading(false);
        });
    }, [ps.id]);

    const handleClientClick = (client) => {
        setSelectedClient(client);
        nav("/client-page/" + client.id);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setFilters({
            hasOpenDocs: false,
            hasRunAlerts: false,
            sortBy: 'name'
        });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Apply filters and search
    const filteredClients = clients
        .filter(client =>
            // Filter by search term
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            // Filter by open docs if enabled
            (!filters.hasOpenDocs || (client.open_docs_count && client.open_docs_count > 0)) &&
            // Filter by run alerts if enabled
            (!filters.hasRunAlerts || client.run_alerts === true)
        )
        .sort((a, b) => {

            // Sort by name or open docs
            if (filters.sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                const aCount = a.open_docs_count || 0;
                const bCount = b.open_docs_count || 0;
                return bCount - aCount; // Sort by descending order
            }
        });

    // Calculate pagination
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

    // Calculate clients with open docs count for the badge
    const clientsWithOpenDocs = clients.filter(client =>
        client.open_docs_count && client.open_docs_count > 0
    ).length;

    // Calculate clients with active alerts count for the badge
    const clientsWithRunAlerts = clients.filter(client =>
        client.run_alerts === true
    ).length;

    const handlePageChange = (pageNumber, e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        setCurrentPage(pageNumber);
    };

    return (
        <div className="clients-list-container">
            <div className="clients-list-header-container">
                <h2 className="clients-list-title" >
                    לקוחות של {ps.company_name}
                </h2>
            </div>

            {true && (
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

                    {/* Filter section */}
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

                        {/* New run alerts filter */}
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
                                            <th className="clients-list-header">טלפון</th>
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
                                                    {client.emails && client.emails.length > 0 && (
                                                        <div className="clients-list-contact">
                                                            <span className="clients-list-email-icon"></span>
                                                            <span className="clients-list-info">{client.emails[0]}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="clients-list-cell clients-list-phone-cell">
                                                    {client.phones && client.phones.length > 0 && (
                                                        <div className="clients-list-contact">
                                                            <span className="clients-list-phone-icon"></span>
                                                            <span className="clients-list-info">{client.phones[0]}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="clients-list-cell clients-list-docs-cell">
                                                    {client.open_docs_count > 0 ? (
                                                        <span className="clients-list-docs-badge">
                                                            {client.open_docs_count}
                                                        </span>
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
            )}
        </div>
    );
};

export default ProviderClients;
// import React, { useContext, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAllClients } from '../../../api/general_be_api';
// import './ProviderClients.css';
// import { AppContext } from '../../../App';


// const ProviderClients = ({ ps }) => {

//     const [clients, setClients] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     const [currentPage, setCurrentPage] = useState(1);
//     const clientsPerPage = 15;

//     // New state for filters
//     const [filters, setFilters] = useState({
//         hasOpenDocs: false,
//         sortBy: 'name' // 'name' or 'openDocs'
//     });

//     const { setSelectedClient } = useContext(AppContext);
//     const nav = useNavigate();

//     useEffect(() => {
//         setIsLoading(true);
//         getAllClients(ps.id).then((res) => {
//             setClients(res);
//             setIsLoading(false);
//         });
//     }, [ps.id]);

//     const handleClientClick = (client) => {
//         setSelectedClient(client);
//         nav("/client-page/" + client.id);
//     };

//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value);
//         setCurrentPage(1); // Reset to first page on new search
//     };

//     const handleFilterChange = (filterName, value) => {
//         setFilters(prev => ({
//             ...prev,
//             [filterName]: value
//         }));
//         setCurrentPage(1); // Reset to first page on filter change
//     };

//     const clearFilters = () => {
//         setFilters({
//             hasOpenDocs: false,
//             sortBy: 'name'
//         });
//         setSearchTerm('');
//         setCurrentPage(1);
//     };

//     // Apply filters and search
//     const filteredClients = clients
//         .filter(client =>
//             // Filter by search term
//             client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
//             // Filter by open docs if enabled
//             (!filters.hasOpenDocs || (client.open_docs_count && client.open_docs_count > 0))
//         )
//         .sort((a, b) => {

//             // Sort by name or open docs
//             if (filters.sortBy === 'name') {
//                 return a.name.localeCompare(b.name);
//             } else {
//                 const aCount = a.open_docs_count || 0;
//                 const bCount = b.open_docs_count || 0;
//                 return bCount - aCount; // Sort by descending order
//             }
//         });

//     // Calculate pagination
//     const indexOfLastClient = currentPage * clientsPerPage;
//     const indexOfFirstClient = indexOfLastClient - clientsPerPage;
//     const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
//     const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

//     // Calculate clients with open docs count for the badge
//     const clientsWithOpenDocs = clients.filter(client =>
//         client.open_docs_count && client.open_docs_count > 0
//     ).length;

//     const handlePageChange = (pageNumber, e) => {
//         e.stopPropagation(); // Prevent event from bubbling up
//         setCurrentPage(pageNumber);
//     };

//     return (
//         <div className="clients-list-container">
//             <div className="clients-list-header-container">
//                 <h2 className="clients-list-title" >
//                     לקוחות של {ps.company_name}
//                 </h2>
//             </div>

//             {true && (
//                 <div className="clients-list-content">
//                     <div className="clients-list-search-wrapper">
//                         <input
//                             type="text"
//                             className="clients-list-search"
//                             placeholder="חיפוש לפי שם..."
//                             value={searchTerm}
//                             onChange={handleSearch}
//                         />
//                         <div className="clients-list-search-icon"></div>
//                     </div>

//                     {/* New filter section */}
//                     <div className="clients-list-filters">
//                         <div className="clients-list-filter-group">
//                             <label className="clients-list-filter-checkbox">
//                                 <input
//                                     type="checkbox"
//                                     checked={filters.hasOpenDocs}
//                                     onChange={(e) => handleFilterChange('hasOpenDocs', e.target.checked)}
//                                 />
//                                 <span className="clients-list-filter-text">הצג רק לקוחות עם מסמכים פתוחים</span>
//                                 <span className="clients-list-badge">{clientsWithOpenDocs}</span>
//                             </label>
//                         </div>

//                         <div className="clients-list-filter-group">
//                             <span className="clients-list-filter-label">מיון לפי:</span>
//                             <div className="clients-list-filter-options">
//                                 <label className="clients-list-filter-radio">
//                                     <input
//                                         type="radio"
//                                         name="sortBy"
//                                         checked={filters.sortBy === 'name'}
//                                         onChange={() => handleFilterChange('sortBy', 'name')}
//                                     />
//                                     <span className="clients-list-filter-text">שם</span>
//                                 </label>
//                                 <label className="clients-list-filter-radio">
//                                     <input
//                                         type="radio"
//                                         name="sortBy"
//                                         checked={filters.sortBy === 'openDocs'}
//                                         onChange={() => handleFilterChange('sortBy', 'openDocs')}
//                                     />
//                                     <span className="clients-list-filter-text">מסמכים פתוחים</span>
//                                 </label>
//                             </div>
//                         </div>

//                         <button
//                             className="clients-list-clear-filters"
//                             onClick={clearFilters}
//                             disabled={!searchTerm && !filters.hasOpenDocs && filters.sortBy === 'name'}
//                         >
//                             נקה סינון
//                         </button>
//                     </div>

//                     {isLoading ? (
//                         <div className="clients-list-loading">
//                             <div className="clients-list-spinner"></div>
//                             <span>טוען לקוחות...</span>
//                         </div>
//                     ) : filteredClients.length === 0 ? (
//                         <div className="clients-list-empty">לא נמצאו לקוחות מתאימים</div>
//                     ) : (
//                         <>
//                             <div className="clients-list-table-container">
//                                 <table className="clients-list-table">
//                                     <thead>
//                                         <tr>
//                                             <th className="clients-list-header">שם</th>
//                                             <th className="clients-list-header">אימייל</th>
//                                             <th className="clients-list-header">טלפון</th>
//                                             <th className="clients-list-header">מסמכים פתוחים</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {currentClients.map((client) => (
//                                             <tr
//                                                 key={client.id}
//                                                 onClick={() => handleClientClick(client)}
//                                                 className="clients-list-row"
//                                             >
//                                                 <td className="clients-list-cell clients-list-name-cell">{client.name}</td>
//                                                 <td className="clients-list-cell clients-list-email-cell">
//                                                     {client.emails && client.emails.length > 0 && (
//                                                         <div className="clients-list-contact">
//                                                             <span className="clients-list-email-icon"></span>
//                                                             <span className="clients-list-info">{client.emails[0]}</span>
//                                                         </div>
//                                                     )}
//                                                 </td>
//                                                 <td className="clients-list-cell clients-list-phone-cell">
//                                                     {client.phones && client.phones.length > 0 && (
//                                                         <div className="clients-list-contact">
//                                                             <span className="clients-list-phone-icon"></span>
//                                                             <span className="clients-list-info">{client.phones[0]}</span>
//                                                         </div>
//                                                     )}
//                                                 </td>
//                                                 <td className="clients-list-cell clients-list-docs-cell">
//                                                     {client.open_docs_count > 0 ? (
//                                                         <span className="clients-list-docs-badge">
//                                                             {client.open_docs_count}
//                                                         </span>
//                                                     ) : (
//                                                         <span className="clients-list-no-docs">0</span>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {totalPages > 1 && (
//                                 <div className="clients-list-pagination">
//                                     <button
//                                         className="clients-list-pagination-button clients-list-pagination-prev"
//                                         onClick={(e) => handlePageChange(currentPage - 1, e)}
//                                         disabled={currentPage === 1}
//                                     >
//                                         <span className="clients-list-pagination-prev-icon"></span>
//                                     </button>

//                                     <div className="clients-list-pagination-info">
//                                         עמוד {currentPage} מתוך {totalPages}
//                                     </div>

//                                     <button
//                                         className="clients-list-pagination-button clients-list-pagination-next"
//                                         onClick={(e) => handlePageChange(currentPage + 1, e)}
//                                         disabled={currentPage === totalPages}
//                                     >
//                                         <span className="clients-list-pagination-next-icon"></span>
//                                     </button>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProviderClients;
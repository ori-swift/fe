import React, { useContext, useEffect, useState } from 'react';
import { getAllClients } from '../../../api/general_be_api';
import './ProviderClients.css';
import { AppContext } from '../../../App';

const ProviderClients = ({ ps }) => {
    const [show, setShow] = useState(false);
    const [clients, setClients] = useState([]);
    // const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 15;

    const { setSelectedClient } = useContext(AppContext);

    useEffect(() => {
        setIsLoading(true);
        getAllClients(ps.id).then((res) => {
            console.log(res);

            setClients(res);
            setIsLoading(false);
        });
    }, [ps.id]);

    const handleClientClick = (client) => {        
        setSelectedClient(client);
        nav("/client")
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    return (
        <div className="clients-list-container" onClick={() => { setShow(!show) }}>
            <h2 className="clients-list-title">
                {!show && <span> ^ </span>}
                {show && <span> X </span>}
                לקוחות של {ps.provider_name}
            </h2>
            {show && <>

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
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentClients.map((client) => (
                                        <tr
                                            key={client.id}                                            
                                            onClick={() => handleClientClick(client)}
                                        >
                                            <td className="clients-list-cell clients-list-name-cell">{client.name}</td>
                                            <td className="clients-list-cell clients-list-email-cell">
                                                {client.emails.length > 0 && (
                                                    <div className="clients-list-contact">
                                                        <span className="clients-list-email-icon"></span>
                                                        <span className="clients-list-info">{client.emails[0]}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="clients-list-cell clients-list-phone-cell">
                                                {client.phones.length > 0 && (
                                                    <div className="clients-list-contact">
                                                        <span className="clients-list-phone-icon"></span>
                                                        <span className="clients-list-info">{client.phones[0]}</span>
                                                    </div>
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
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="clients-list-pagination-prev-icon"></span>
                                </button>

                                <div className="clients-list-pagination-info">
                                    עמוד {currentPage} מתוך {totalPages}
                                </div>

                                <button
                                    className="clients-list-pagination-button clients-list-pagination-next"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="clients-list-pagination-next-icon"></span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </>}
        </div>
    );
};

export default ProviderClients;
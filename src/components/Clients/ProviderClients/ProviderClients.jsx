import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added this import
import { getAllClients } from '../../../api/general_be_api';
import './ProviderClients.css';
import { AppContext } from '../../../App';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import icons

const ProviderClients = ({ ps }) => {
        

    // const [show, setShow] = useState(false);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 15;

    const { setSelectedClient } = useContext(AppContext);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        setIsLoading(true);
        getAllClients(ps.id).then((res) => {            
            setClients(res);
            setIsLoading(false);
        });
    }, [ps.id]);

    const handleClientClick = (client) => {        
        setSelectedClient(client);
        navigate("/client-page/" + client.id); 
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

    const handlePageChange = (pageNumber, e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        setCurrentPage(pageNumber);
    };

    // const toggleShow = (e) => {
    //     e.stopPropagation(); // Prevent event from bubbling up
    //     setShow(!show);
    // };
    console.log(ps);
    
    return (
        <div className="clients-list-container">
            <div className="clients-list-header-container">
                {/* <h2 className="clients-list-title" onClick={toggleShow}> */}
                {/* <h2 className="clients-list-title" onClick={toggleShow}> */}
                <h2 className="clients-list-title" >
                    לקוחות של {ps.company_name}
                </h2>
                {/* <button 
                    className="clients-list-toggle-button" 
                    onClick={toggleShow}
                    aria-label={show ? "הסתר לקוחות" : "הצג לקוחות"}
                >
                    {show ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button> */}
            </div>
            
            {/* {show && ( */}
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
                                                className="clients-list-row"
                                            >
                                                <td className="clients-list-cell clients-list-name-cell">{client.name}</td>
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
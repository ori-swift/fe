import React, { useContext, useEffect, useState } from 'react';

import './CompanySelectionPage.css';
import { AppContext } from '../../App';

const CompanySelectionPage = () => {
  const { userData, selectedCompany, setSelectedCompany } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter companies based on search term
  const filteredCompanies = userData?.companies?.filter(company => 
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    // Check if userData exists and has a companies array
    if (userData && userData.companies && userData.companies.length === 1) {
      // If there's exactly one company, automatically select it
      setSelectedCompany(userData.companies[0]);
    }
  }, [userData, setSelectedCompany]); // Dependencies: userData and setSelectedCompany

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  return (
    <div className="select-company-page-container">
      <header className="select-company-page-header">
        <h1>Select Company</h1>
        <p>Choose a company to view its details</p>
      </header>

      <div className="select-company-page-search-container">
        <input
          type="text"
          placeholder="Search companies..."
          className="select-company-page-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="select-company-page-grid">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              className={`select-company-page-card ${
                selectedCompany?.id === company.id ? 'select-company-page-card-selected' : ''
              }`}
              onClick={() => handleCompanySelect(company)}
            >
              <div className="select-company-page-card-header">
                <h2>{company.company_name}</h2>
              </div>
              <div className="select-company-page-card-content">
                <p><span>Provider:</span> {company.provider_name}</p>
                <p><span>ID:</span> {company.id}</p>
              </div>
              {selectedCompany?.id === company.id && (
                <div className="select-company-page-card-selected-indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="select-company-page-no-results">
            <p>No companies found matching your search criteria.</p>
          </div>
        )}
      </div>

      {selectedCompany && (
        <div className="select-company-page-selected-details">
          <h3>Selected Company Details</h3>
          <div className="select-company-page-details-container">
            <p><strong>Name:</strong> {selectedCompany.company_name}</p>
            <p><strong>Provider:</strong> {selectedCompany.provider_name}</p>
            <p><strong>Provider ID:</strong> {selectedCompany.provider_id}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelectionPage;
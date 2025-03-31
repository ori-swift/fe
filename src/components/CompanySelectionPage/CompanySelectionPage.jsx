import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './CompanySelectionPage.css';
import { AppContext } from '../../App';

const CompanySelectionPage = () => {
  const { userData, selectedCompany, setSelectedCompany } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Filter companies based on search term
  const filteredCompanies = userData?.companies?.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    // Check if there's a stored company in localStorage
    const storedCompany = localStorage.getItem('selected_company');

    if (storedCompany && userData?.companies) {
      const parsedCompany = JSON.parse(storedCompany);
      const foundCompany = userData.companies.find(company => company.id === parsedCompany.id);

      // If the stored company exists in userData, set it as selected
      if (foundCompany) {
        setSelectedCompany(foundCompany);
        return;
      }
    }

    // If no stored company or it doesn't exist in userData
    // Check if userData exists and has a companies array with exactly one company
    if (userData && userData.companies && userData.companies.length === 1) {
      // If there's exactly one company, automatically select it
      setSelectedCompany(userData.companies[0]);
      // Save to localStorage
      localStorage.setItem('selected_company', JSON.stringify(userData.companies[0]));
    }
  }, [userData, setSelectedCompany]); // Dependencies: userData and setSelectedCompany

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);    
    localStorage.setItem('selected_company', JSON.stringify(company));
  };

  const handlePlaybookNavigation = (type) => {

    navigate(`/playbook/${selectedCompany.playbooks[type]}`);
  };

  return (
    <div className="select-company-page-container" dir="rtl">
      <header className="select-company-page-header">
        <h1>בחר חברה</h1>
        <p>בחר אחת מהחברות להצגת הפרטים</p>
      </header>

      {/* Selected Company Section - Displayed First */}
      {selectedCompany && (
        <div className="select-company-page-selected-card">
          <div className="select-company-page-selected-header">
            <h2>{selectedCompany.company_name}</h2>
            <div className="select-company-page-selected-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>נבחרה</span>
            </div>
          </div>
          <div className="select-company-page-selected-content">
            <div className="select-company-page-selected-details">
              <div className="select-company-page-details-row">
                <p><strong>שם:</strong> {selectedCompany.company_name}</p>
                <p><strong>ספק:</strong> {selectedCompany.provider_name}</p>
                <p><strong>מזהה ספק:</strong> {selectedCompany.provider_id}</p>
                <p><strong>מזהה:</strong> {selectedCompany.id}</p>
              </div>
            </div>
            <button
              className="select-company-page-playbook-button"
              onClick={() => { handlePlaybookNavigation("tax_invoice") }}
            >
              הגדרת פלייבוק כללי לחברה לחשבוניות מס
            </button>
            <br />
            <button
              className="select-company-page-playbook-button"
              onClick={() => { handlePlaybookNavigation("proforma") }}
            >
              הגדרת פלייבוק כללי לחברה לדרישות תשלום
            </button>
          </div>
        </div>
      )}

      <div className="select-company-page-search-container">
        <input
          type="text"
          placeholder="חיפוש חברות..."
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
              className={`select-company-page-card ${selectedCompany?.id === company.id ? 'select-company-page-card-selected' : ''
                }`}
              onClick={() => handleCompanySelect(company)}
            >
              <div className="select-company-page-card-header">
                <h2>{company.company_name}</h2>
              </div>
              <div className="select-company-page-card-content">
                <p><span>ספק:</span> {company.provider_name}</p>
                <p><span>מזהה:</span> {company.id}</p>
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
            <p>לא נמצאו התאמות לחיפוש</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySelectionPage;
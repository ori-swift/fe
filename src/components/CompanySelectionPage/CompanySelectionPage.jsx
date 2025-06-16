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

  // console.log(selectedCompany);
  // console.log(getPlanById(selectedCompany?.plan));
  
  
  return (
    <div className="select-company-page-container" dir="rtl">
      <header className="select-company-page-header">
        <h1>בחר חברה</h1>
        <p>בחר אחת מהחברות להצגת הפרטים</p>
      </header>



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
              <div> {company.relation} </div>
              <div> תוכנית: {company.plan.name} </div>
              <div className="select-company-page-card-content">
                <p><span>ספק:</span> {company.provider_name}</p>
                <p><span>מזהה:</span> {company.id}</p>


              </div>
                <div className="select-company-page-usage">
                  <h5> שימוש במערכת </h5>
                  <p><span>מיילים:</span> {company.usage?.usage_email ?? 0}</p>
                  <p><span>מסרונים:</span> {company.usage?.usage_sms ?? 0}</p>
                  <p><span>וואטסאפ:</span> {company.usage?.usage_whatsapp ?? 0}</p>
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
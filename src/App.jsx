import { createContext, useEffect, useState } from 'react';
import './App.css';
import { checkToken, logout } from './api/auth_api';
import SiteRoutes from './SiteRoutes';
import Header from './components/Header/Header';
import { useNavigate } from 'react-router-dom';
import CompanySelectionPage from './components/CompanySelectionPage/CompanySelectionPage';
import { ConfirmationProvider } from './utils/ConfirmationContext';
import Settings from './components/Settings/Settings';
import { Button } from 'react-bootstrap';
import { clearLocalStorageExcept } from './utils/helpers';
import { IS_DEV, SERVER_URL } from './config';
import GoogleLoginPage from './components/Auth/GoogleAuth/GoogleLoginPage';
import OnBoarding from './components/OnBoarding/OnBoarding';
// import { ConfirmationProvider } from './context/ConfirmationContext';

export const AppContext = createContext();

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState(null);

  const [selectedClient, setSelectedClient] = useState({});
  const [selectedCompany, setSelectedCompany] = useState();

  const nav = useNavigate();


  const refetchUserData = async () => {
    const token = localStorage.getItem("sc_token");
    if (token) {
      const userData_ = await checkToken(token);

      const selectedCompanyRaw = localStorage.getItem("selected_company");
      const selectedCompany = selectedCompanyRaw ? JSON.parse(selectedCompanyRaw) : null;

      if (userData_) {
        setUserData(userData_);
        setIsLogged(true);

        if (selectedCompany) {
          const updatedCompany = userData_.companies.find(
            (c) => c.id === selectedCompany.id
          );

          if (updatedCompany) {
            localStorage.setItem("selected_company", JSON.stringify(updatedCompany));
          }
        }

        return true;
      } else {
        localStorage.removeItem("sc_token");
      }
    }
    return false;
  };

  //   const refetchUserData = async () => {
  //     const token = localStorage.getItem("sc_token");
  //     if (token) {
  //       const userData_ = await checkToken(token)

  //       console.log(localStorage.getItem("selected_company"));
  //       /* {"id":41,"provider_name":"Green Invoice","provider_id":1,"company_name":"ח.י","playbook":101,"default_alert_template_email":30,"default_alert_template_sms":30,"default_alert_template_whatsapp":30,"language":"he","email":null,"usage":null,"plan":{"id":3,"name":"pro","price_nis":249,"max_alerts":5000,"allow_email":true,"allow_sms":true,"allow_whatsapp":true,"max_email":5000,"max_sms":2000,"max_whatsapp":2000,"is_active":true},"relation":"admin","cred_json":{}} */

  //       console.log(userData_);
  //       /*
  //       {
  //     "user": {
  //         "id": 6,
  //         "username": "ori100"
  //     },
  //     "companies": [
  //         {
  //             "id": 38,
  //             "provider_name": "Green Invoice",
  //             "provider_id": 1,
  //             "company_name": "ח.י.מ",
  //             "playbook": 98,
  //             "default_alert_template_email": 30,
  //             "default_alert_template_sms": 30,
  //             "default_alert_template_whatsapp": 30,
  //             "language": "he",
  //             "email": null,
  //             "usage": {
  //                 "year": 2025,
  //                 "month": 6,
  //                 "usage_email": 3,
  //                 "usage_sms": 0,
  //                 "usage_whatsapp": 0
  //             },
  //             "plan": {
  //                 "id": 1,
  //                 "name": "free-trial",
  //                 "price_nis": 0,
  //                 "max_alerts": 500,
  //                 "allow_email": true,
  //                 "allow_sms": false,
  //                 "allow_whatsapp": false,
  //                 "max_email": 500,
  //                 "max_sms": 0,
  //                 "max_whatsapp": 0,
  //                 "is_active": true
  //             },
  //             "relation": "viewer",
  //             "cred_json": {}
  //         },
  //         {
  //             "id": 41,
  //             "provider_name": "Green Invoice",
  //             "provider_id": 1,
  //             "company_name": "ח.י",
  //             "playbook": 101,
  //             "default_alert_template_email": 30,
  //             "default_alert_template_sms": 30,
  //             "default_alert_template_whatsapp": 30,
  //             "language": "he",
  //             "email": null,
  //             "usage": null,
  //             "plan": {
  //                 "id": 3,
  //                 "name": "pro",
  //                 "price_nis": 249,
  //                 "max_alerts": 5000,
  //                 "allow_email": true,
  //                 "allow_sms": true,
  //                 "allow_whatsapp": true,
  //                 "max_email": 5000,
  //                 "max_sms": 2000,
  //                 "max_whatsapp": 2000,
  //                 "is_active": true
  //             },
  //             "relation": "admin",
  //             "cred_json": {}
  //         }
  //     ]
  // }
  //        */

  //       if (userData_) {
  //         setUserData(userData_);
  //         setIsLogged(true);

  //         return true
  //       } else {
  //         localStorage.removeItem("sc_token");
  //       }
  //     }
  //     return false;
  //   }

  useEffect(() => {

    refetchUserData().then((res) => {
      if (!res) {
        nav("/auth");
      }
    }).catch((e) => {
      console.log(e);
      alert("Error on useEffect")
    })
  }, [isLogged, nav]);


  useEffect(() => {

    // Check if there's a stored company in localStorage
    const storedCompany = localStorage.getItem('selected_company');

    if (storedCompany) {
      try {
        // Parse the stored company data
        const parsedCompany = JSON.parse(storedCompany);

        // Check if the stored company exists in userData.companies
        if (userData && userData.companies) {
          const foundCompany = userData.companies.find(company => company.id === parsedCompany.id);

          // If the company is found in userData, set it as selected
          if (foundCompany) {
            setSelectedCompany(foundCompany);
            localStorage.setItem('selected_company', JSON.stringify(foundCompany));
          } else {
            // If company not found in current userData, clear localStorage
            localStorage.removeItem('selected_company');
          }
        }
      } catch (error) {
        // Handle any parsing errors
        alert('Error parsing stored company:', error);
        // localStorage.removeItem('selected_company');
      }
    }
    console.log(userData);

  }, [userData]);


  const handleLogout = async () => {


    // disconnect all connected devices
    await logout();

    setIsLogged(false);
    setUserData(null);
    setSelectedClient(null);
    setSelectedCompany(null);
    // localStorage.removeItem("sc_token");
    localStorage.clear();
    nav("/auth");
  };



  return (
    <ConfirmationProvider>
      <AppContext.Provider value={{
        isLogged, setIsLogged, userData, setUserData, setSelectedClient,
        selectedClient, selectedCompany, setSelectedCompany, refetchUserData
      }}>
        <div>
          <div style={{ backgroundColor: IS_DEV ? 'red' : 'green', position: 'fixed', width: '100%', height: '8px', fontSize: '8px' }}>
            {SERVER_URL.includes("127.") ? "Dev" : "Stage"}
          </div>
          <Header handleLogout={handleLogout} isLogged={isLogged} />

          {(userData && !selectedCompany) ?
            (
              // Check onboarding status first
              userData.user?.onboarding_status === "account_created" ?
                <OnBoarding/> :
                userData.user?.onboarding_status === "profile_completed" && userData.companies?.length === 0 ?
                  <Settings /> : // Let them add their first company
                  // userData.user?.onboarding_status === "company_added" && userData.companies?.some(c => c.relation === "admin" && !c.has_valid_credentials) ?
                    // <Settings /> : // Show settings to update credentials
                    // userData.companies && userData.companies.length > 0 ?
                      <CompanySelectionPage /> 
                      // <Settings />
            )
            :
            <>
              <Button className='back-btn' onClick={() => { nav(-1) }}> חזרה </Button>
              <SiteRoutes />
            </>
          }
          {/* {(userData && !selectedCompany) ?
            (userData.companies && userData.companies.length > 0 ? <CompanySelectionPage /> : <Settings />)
            :
            <>
              <Button className='back-btn' onClick={() => { nav(-1) }}> חזרה </Button>
              <SiteRoutes />
            </>
          } */}
        </div>
      </AppContext.Provider>
    </ConfirmationProvider>
  );
}

export default App;

import { createContext, useEffect, useState } from 'react';
import './App.css';
import { checkToken } from './api/auth_api';
import SiteRoutes from './SiteRoutes';
import Header from './components/Header/Header';
import { useNavigate } from 'react-router-dom';
import CompanySelectionPage from './components/CompanySelectionPage/CompanySelectionPage';
import { ConfirmationProvider } from './utils/ConfirmationContext';
import Settings from './components/Settings/Settings';
// import { ConfirmationProvider } from './context/ConfirmationContext';

export const AppContext = createContext();

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState(null);

  const [selectedClient, setSelectedClient] = useState({});
  const [selectedCompany, setSelectedCompany] = useState();

  const nav = useNavigate();

  console.log("App rendered", isLogged, userData);



  useEffect(() => {
    // check token
    const token = localStorage.getItem("sc_token");
    if (token) {
      checkToken(token).then((userData_) => {
        if (userData_) {
          // console.log(userData_);
          setUserData(userData_);
          setIsLogged(true);
          // nav("/home")
        }
      });
    } else {
      nav("/auth");
    }
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
  }, [userData]);


  const handleLogout = () => {
    setIsLogged(false);
    // localStorage.removeItem("sc_token");
    localStorage.clear();
    nav("/auth");
  };

  return (
    <ConfirmationProvider>
      <AppContext.Provider value={{
        isLogged, setIsLogged, userData, setUserData, setSelectedClient,
        selectedClient, selectedCompany, setSelectedCompany
      }}>
        <div>
          <Header handleLogout={handleLogout} isLogged={isLogged} />
          {(userData && !selectedCompany) ?
            (userData.companies && userData.companies.length > 0 ? <CompanySelectionPage /> : <Settings />)
            :
            <SiteRoutes />
          }
        </div>
      </AppContext.Provider>
    </ConfirmationProvider>
  );
}

export default App;

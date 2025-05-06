import { createContext, useEffect, useState } from 'react';
import './App.css';
import { checkToken } from './api/auth_api';
import SiteRoutes from './SiteRoutes';
import Header from './components/Header/Header';
import { useNavigate } from 'react-router-dom';
import CompanySelectionPage from './components/CompanySelectionPage/CompanySelectionPage';
import { ConfirmationProvider } from './utils/ConfirmationContext';
import Settings from './components/Settings/Settings';
import { Button } from 'react-bootstrap';
import { clearLocalStorageExcept } from './utils/helpers';
import { IS_DEV, SERVER_URL } from './config';
// import { ConfirmationProvider } from './context/ConfirmationContext';

export const AppContext = createContext();

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState(null);

  const [selectedClient, setSelectedClient] = useState({});
  const [selectedCompany, setSelectedCompany] = useState();

  const nav = useNavigate();
  
  const refetchUserDate = async () => {
    const token = localStorage.getItem("sc_token");
    if (token) {
      const userData_ = await checkToken(token)
      console.log(userData_);
      if (userData_) {
        setUserData(userData_);
        setIsLogged(true);

        return true
      }
    }
    return false;
  }

  useEffect(() => {

    refetchUserDate().then((res)=>{
      if (!res){
        nav("/auth");
      }
    }).catch((e)=>{
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


  const handleLogout = () => {
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
        selectedClient, selectedCompany, setSelectedCompany, refetchUserDate
      }}>
        <div>
        <div style={{backgroundColor: IS_DEV ?  'red': 'green'}}>
        {SERVER_URL.includes("127.") ? "Dev" : "Stage"}
      </div>
          <Header handleLogout={handleLogout} isLogged={isLogged} />
          {(userData && !selectedCompany) ?
            (userData.companies && userData.companies.length > 0 ? <CompanySelectionPage /> : <Settings />)
            :
            <>
            <Button className='back-btn' onClick={()=>{nav(-1)}}> חזרה </Button>
            <SiteRoutes />
            </>
          }
        </div>
      </AppContext.Provider>
    </ConfirmationProvider>
  );
}

export default App;

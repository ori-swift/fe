import { createContext, useEffect, useState } from 'react';
import './App.css';
import { checkToken } from './api/auth_api';
import SiteRoutes from './SiteRoutes';
import Header from './components/Header/Header';
import { useNavigate } from 'react-router-dom';
import CompanySelectionPage from './components/CompanySelectionPage/CompanySelectionPage';
import { ConfirmationProvider } from './utils/ConfirmationContext';
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
            <CompanySelectionPage />
          :        
            <SiteRoutes />
          }
        </div>
      </AppContext.Provider>
    </ConfirmationProvider>
  );
}

export default App;
// import { createContext, useEffect, useState } from 'react';
// import './App.css';
// import { checkToken } from './api/auth_api';
// import SiteRoutes from './SiteRoutes';
// import Header from './components/Header/Header';
// import { useNavigate } from 'react-router-dom';
// import CompanySelectionPage from './components/CompanySelectionPage/CompanySelectionPage';

// export const AppContext = createContext();

// function App() {
//   const [isLogged, setIsLogged] = useState(false);
//   const [userData, setUserData] = useState(null);

//   const [selectedClient, setSelectedClient] = useState({})
//   const [selectedCompany, setSelectedCompany] = useState()

//   const nav = useNavigate();

//   console.log("App rendered", isLogged, userData);

//   useEffect(() => {
//     // check token
//     const token = localStorage.getItem("sc_token");
//     if (token) {
//       checkToken(token).then((userData_) => {
//         if (userData_) {
//           // console.log(userData_);
//           setUserData(userData_);
//           setIsLogged(true);
//           // nav("/home")
//         }
//       })
//     } else {
//       nav("/auth");
//     }
//   }, [isLogged])

//   const handleLogout = () => {
//     setIsLogged(false);
//     // localStorage.removeItem("sc_token");
//     localStorage.clear();
//     nav("/auth");
//   }

//   return (
//     <AppContext.Provider value={{
//       isLogged, setIsLogged, userData, setUserData, setSelectedClient,
//       selectedClient, selectedCompany, setSelectedCompany
//     }}>
//       <div>
//         <Header handleLogout={handleLogout} isLogged={isLogged} />
//         {(userData && !selectedCompany) ? 
//         <CompanySelectionPage/>
//         :        
//         <SiteRoutes />
//         }
//       </div>
//     </AppContext.Provider>
//   );
// }

// export default App;

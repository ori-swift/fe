import { createContext, useEffect, useState } from 'react';
import './App.css';
import { checkToken } from './api/auth_api';
import SiteRoutes from './SiteRoutes';
import Header from './components/Header/Header';
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext();

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState(null);

  const [selectedClient, setSelectedClient] = useState({})

  const nav = useNavigate();

  console.log("App rendered", isLogged);

  useEffect(() => {
    // check token
    const token = localStorage.getItem("sc_token");
    if (token) {
      checkToken(token).then((userData_) => {
        if (userData_) {
          console.log(userData_);
          setUserData(userData_);
          setIsLogged(true);
          // nav("/home")
        }
      })
    } else {
      nav("/auth");
    }
  }, [])

  const handleLogout = () => {
    setIsLogged(false);
    localStorage.removeItem("sc_token");
    nav("/auth");
  }

  return (
    <AppContext.Provider value={{ isLogged, setIsLogged, userData, setUserData, setSelectedClient, selectedClient }}>
      <div>
        <Header handleLogout={handleLogout} isLogged={isLogged} />
        <SiteRoutes />
      </div>
    </AppContext.Provider>
  );
}

export default App;

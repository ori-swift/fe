import React, { useContext, useEffect } from 'react'
import ProviderClients from './ProviderClients/ProviderClients';
import { AppContext } from '../../App';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
    const { userData, isLogged, selectedCompany } = useContext(AppContext);
    const nav = useNavigate()
    useEffect(() => {
        if (!isLogged) {
            nav("/auth")
        }
    }, [])


    if (!userData?.companies) {
        return <p>טוען...</p>;
    }

    return (
        <div>
            <ProviderClients key={selectedCompany.id} ps={selectedCompany} />            
        </div>
    );
}
export default Clients
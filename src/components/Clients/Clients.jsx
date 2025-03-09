import React, { useContext, useEffect } from 'react'
import ProviderClients from './ProviderClients/ProviderClients';
import { AppContext } from '../../App';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
    const { userData, isLogged } = useContext(AppContext);
    const nav = useNavigate()
    useEffect(() => {
        if (!isLogged) {
            nav("/auth")
        }
    }, [])

    console.log("Clients rendered");
    

    if (!userData?.credentials) {
        return <p>טוען...</p>;
    }

    return (
        <div>
            {userData.credentials.map((ps) => {
                return <ProviderClients key={ps.id} ps={ps} />
            })}
        </div>
    );
}
export default Clients
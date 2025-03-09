import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import "./Settings.css";
import { updateUserCred } from "../../api/cred_api";
import { useNavigate } from "react-router-dom";
import ProviderSettings from "../ProviderSettings/ProviderSettings";

export default function Settings() {
  const { userData, isLogged } = useContext(AppContext);


  const nav = useNavigate()
  useEffect(() => {
    if (!isLogged) {
      nav("/auth")
    }
  })


  if (!userData?.credentials) {
    return <p>טוען...</p>;
  }

  return (
    <div>
      {userData.credentials.map((ps) => {
        return <ProviderSettings key={ps.id} ps={ps} />
      })}
    </div>
  );
}

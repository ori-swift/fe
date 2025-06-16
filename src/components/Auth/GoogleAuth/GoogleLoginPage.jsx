import React, { useContext, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../../App";
import { GOOGLE_AUTH_CLIENT_ID } from "../../../config";
import { getTokenByProviderCredential } from "../../../api/auth_api";

const clientId = GOOGLE_AUTH_CLIENT_ID;

const GoogleLoginPage = () => {
  const nav = useNavigate();

  const { setUserData, userData, isLogged, setIsLogged } = useContext(AppContext);

  useEffect(() => {
    if (isLogged) {
      // alert("Already logged")
      nav("/home");
    }
  }, []);

  const onSuccess = async (response) => {
    console.log("Login Success at FE side:", response);

    const token = await getTokenByProviderCredential(
      response.credential,
      "google"
    );

    // console.log(data);
    /*
    {
    "token": "6c1fac1186f301aeefd3555566571c5a16bc32f0",
    "username": "Ori Brook",
    "email": "ori@swiftcollect.io"
    }
    */

    if (token) {
      // alert("Successfully logged-in");
      window.location = window.location; // reload app, now with token on localstorage
    }
  };

  const onFailure = (response) => {
    console.log("Login Failed:", response);
  };

  return (
    <div>
      <GoogleOAuthProvider clientId={clientId}>
        <div className="login-container">

          <div className="google-auth-container">
            <GoogleLogin
              clientId={clientId}
              onSuccess={onSuccess}
              onFailure={onFailure}
              buttonText="Continue with Google"
              className="google-login-button"
            />
          </div>

        </div>
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleLoginPage;
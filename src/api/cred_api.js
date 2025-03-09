import { SERVER_URL } from "../config";

export async function updateUserCred(data, cred_id) {    
    data.cred_id = cred_id;
    const token = localStorage.getItem("sc_token");
    const response = await fetch(`${SERVER_URL}/usercred`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        },
        body: JSON.stringify(data)
    });
    res =  response.json();
    console.log(res);
    return res;
    
}

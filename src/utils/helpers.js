import { fetchPlans } from "../api/general_be_api";

export function clearLocalStorageExcept() {
  
  const keepKeys = new Set(["providers", "sc_token", "selected_company"]);
  Object.keys(localStorage).forEach(key => {
    if (!keepKeys.has(key)) {
      console.log("removing key", key);
      
      localStorage.removeItem(key);
    }
  });
}

// export async function getPlanById(planId) {
//   let plans = JSON.parse(localStorage.getItem("sc_plans"));
//   if (!plans) {
//     plans = await fetchPlans();
//     localStorage.setItem("sc_plans", JSON.stringify(plans));
//   }
//   return  plans.filter((p)=>p.id === planId)[0]  
// }
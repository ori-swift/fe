export function clearLocalStorageExcept() {
  
  const keepKeys = new Set(["providers", "sc_token", "selected_company"]);
  Object.keys(localStorage).forEach(key => {
    if (!keepKeys.has(key)) {
      console.log("removing key", key);
      
      localStorage.removeItem(key);
    }
  });
}
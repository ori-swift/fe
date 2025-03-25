
// import React, { useEffect, useState, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import { getPlaybook, isPlaybookConfigValid, updatePlaybook } from "../../../api/playbook_api";
// import "./PlaybookPage.css";

// const PlaybookPage = () => {
//     const { id } = useParams();
//     const [state, setState] = useState({
//         playbook: null,
//         formData: null,
//         editMode: false,
//         error: "",
//         loading: true,
//         saving: false,
//         showConfirmation: false,
//         confirmAction: null,
//         confirmMessage: "",
//         activeDropdown: null
//     });

//     // Available notification methods with labels
//     const methodOptions = {
//         email: "אימייל",
//         sms: "SMS",
//         whatsapp: "וואטסאפ"
//     };

//     const fetchPlaybook = useCallback(async () => {
//         setState(prev => ({ ...prev, loading: true }));
//         try {
//             const data = await getPlaybook(id);
//             setState(prev => ({
//                 ...prev,
//                 playbook: data,
//                 formData: {
//                     only_business_days: data.only_business_days,
//                     config: JSON.parse(JSON.stringify(data.config)),
//                     document_id: data.document?.id || null,
//                     client_id: data.client?.id || null,
//                     company_id: data.company?.id || null,
//                 },
//                 loading: false
//             }));
//         } catch (error) {
//             setState(prev => ({ ...prev, error: "Failed to load playbook", loading: false }));
//         }
//     }, [id]);

//     // Close dropdowns when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             // Don't close if clicking on a dropdown button (handled by the button's own click handler)
//             if (event.target.closest('.playbook-page-add-method-btn')) {
//                 return;
//             }
//             // Close if clicking anywhere else
//             if (!event.target.closest('.playbook-page-method-dropdown-content')) {
//                 setState(prev => ({ ...prev, activeDropdown: null }));
//             }
//         };

//         document.addEventListener('click', handleClickOutside);
//         return () => {
//             document.removeEventListener('click', handleClickOutside);
//         };
//     }, []);


//     useEffect(() => {
//         fetchPlaybook();
//     }, [fetchPlaybook]);

//     const handleSave = async () => {
//         setState(prev => ({ ...prev, error: "" }));
//         const validationResult = isPlaybookConfigValid(state.formData.config);

//         if (!validationResult.valid) {
//             setState(prev => ({ ...prev, error: validationResult.error }));
//             return;
//         }

//         setState(prev => ({ ...prev, saving: true }));
//         try {
//             await updatePlaybook(id, state.formData);
//             await fetchPlaybook();
//             setState(prev => ({ ...prev, editMode: false, saving: false }));
//         } catch (error) {
//             setState(prev => ({ ...prev, error: "Failed to save playbook", saving: false }));
//         }
//     };

//     const confirmDialog = (action, message) => {
//         setState(prev => ({
//             ...prev,
//             confirmAction: action,
//             confirmMessage: message,
//             showConfirmation: true
//         }));
//     };

//     const executeConfirmedAction = () => {
//         if (state.confirmAction) {
//             state.confirmAction();
//         }
//         setState(prev => ({ ...prev, showConfirmation: false }));
//     };

//     const handleCancel = () => {
//         if (state.editMode) {
//             confirmDialog(
//                 () => {
//                     setState(prev => ({
//                         ...prev,
//                         formData: {
//                             only_business_days: state.playbook.only_business_days,
//                             config: JSON.parse(JSON.stringify(state.playbook.config)),
//                             document_id: state.playbook.document?.id || null,
//                             client_id: state.playbook.client?.id || null,
//                             company_id: state.playbook.company?.id || null,
//                         },
//                         editMode: false,
//                         error: ""
//                     }));
//                 },
//                 "האם אתה בטוח שברצונך לבטל את השינויים?"
//             );
//         }
//     };

//     const updateFormData = updater => {
//         setState(prev => ({
//             ...prev,
//             formData: updater(prev.formData)
//         }));
//     };

//     // Method handlers
//     const handleMethod = (phaseIdx, time, method, isAdding) => {
//         if (!state.editMode) return;

//         updateFormData(currentFormData => {
//             const updated = { ...currentFormData };
//             const currentMethods = updated.config.phases[phaseIdx].alerts[time] || [];

//             if (isAdding) {
//                 if (!currentMethods.includes(method)) {
//                     updated.config.phases[phaseIdx].alerts[time] = [...currentMethods, method];
//                 }
//             } else {
//                 updated.config.phases[phaseIdx].alerts[time] = currentMethods.filter(m => m !== method);

//                 // If no methods left, remove the time
//                 if (updated.config.phases[phaseIdx].alerts[time].length === 0) {
//                     delete updated.config.phases[phaseIdx].alerts[time];

//                     // If no alerts left for non-first phase, offer to remove the phase
//                     if (Object.keys(updated.config.phases[phaseIdx].alerts).length === 0 && phaseIdx !== 0) {
//                         setTimeout(() => {
//                             confirmDialog(
//                                 () => {
//                                     updateFormData(data => {
//                                         const updated = { ...data };
//                                         updated.config.phases.splice(phaseIdx, 1);
//                                         return updated;
//                                     });
//                                 },
//                                 "אין התראות בפאזה זו. האם להסיר את הפאזה?"
//                             );
//                         }, 0);
//                     }
//                 }
//             }
//             return updated;
//         });
//     };

//     // Phase handlers
//     const addPhase = () => {
//         if (!state.editMode) return;

//         updateFormData(currentFormData => {
//             const updated = { ...currentFormData };
//             const lastPhase = updated.config.phases[updated.config.phases.length - 1];
//             const newStartDay = lastPhase.start_day + (lastPhase.repeat_interval || 1);

//             updated.config.phases.push({
//                 start_day: newStartDay,
//                 repeat_interval: null,
//                 alerts: { "09:00": ["email"] }
//             });
//             return updated;
//         });
//     };

//     const removePhase = (phaseIdx) => {
//         if (!state.editMode || phaseIdx === 0) return;

//         confirmDialog(
//             () => {
//                 updateFormData(currentFormData => {
//                     const updated = { ...currentFormData };
//                     updated.config.phases.splice(phaseIdx, 1);
//                     return updated;
//                 });
//             },
//             "האם אתה בטוח שברצונך להסיר פאזה זו?"
//         );
//     };

//     const addAlertTime = (phaseIdx) => {
//         if (!state.editMode) return;

//         updateFormData(currentFormData => {
//             const updated = { ...currentFormData };
//             const phase = updated.config.phases[phaseIdx];

//             // Get all existing times and sort them
//             const existingTimes = Object.keys(phase.alerts).sort();

//             // If there are no existing times, default to 08:00
//             if (existingTimes.length === 0) {
//                 updated.config.phases[phaseIdx].alerts["08:00"] = ["email"];
//                 setState(prev => ({ ...prev, error: "" }));
//                 return updated;
//             }

//             // Get the latest time
//             const latestTime = existingTimes[existingTimes.length - 1];

//             // Check if the latest time is after 23:00
//             if (latestTime >= "23:00") {
//                 // Don't add a new time if the latest is already 23:00 or later
//                 setState(prev => ({
//                     ...prev,
//                     error: "לא ניתן להוסיף זמן התראה נוסף כאשר קיים זמן התראה אחרי 23:00"
//                 }));
//                 return currentFormData; // Return unchanged
//             }

//             // Calculate the new time (1 hour after the latest time)
//             const [hours, minutes] = latestTime.split(':').map(Number);
//             let newHour = hours + 1;

//             // If the new hour would be after 23, cap it at 23
//             if (newHour > 23) {
//                 newHour = 23;
//             }

//             // Format the new time
//             const newTime = `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

//             // Check if the new time already exists
//             if (phase.alerts[newTime]) {
//                 // Try to find the next available time
//                 for (let hour = 8; hour < 24; hour++) {
//                     for (let min of ['00', '15', '30', '45']) {
//                         const timeStr = `${hour.toString().padStart(2, '0')}:${min}`;
//                         if (!phase.alerts[timeStr]) {
//                             updated.config.phases[phaseIdx].alerts[timeStr] = ["email"];
//                             setState(prev => ({ ...prev, error: "" }));
//                             return updated;
//                         }
//                     }
//                 }
//                 // If we get here, all time slots are taken
//                 setState(prev => ({
//                     ...prev,
//                     error: "כל זמני ההתראות תפוסים"
//                 }));
//                 return currentFormData;
//             }

//             // Set the new alert time with default email method
//             updated.config.phases[phaseIdx].alerts[newTime] = ["email"];
//             setState(prev => ({ ...prev, error: "" }));
//             return updated;
//         });
//     };

//     // // Alert handlers
//     // const addAlertTime = (phaseIdx) => {
//     //     if (!state.editMode) return;

//     //     updateFormData(currentFormData => {
//     //         const updated = { ...currentFormData };
//     //         const phase = updated.config.phases[phaseIdx];
//     //         const minutes = ['00', '15', '30', '45'];

//     //         // Find next available time slot
//     //         for (let hour = 0; hour < 24; hour++) {
//     //             for (let minIdx = 0; minIdx < minutes.length; minIdx++) {
//     //                 const timeStr = `${hour.toString().padStart(2, '0')}:${minutes[minIdx]}`;
//     //                 if (!phase.alerts[timeStr]) {
//     //                     updated.config.phases[phaseIdx].alerts[timeStr] = ["email"];
//     //                     return updated;
//     //                 }
//     //             }
//     //         }
//     //         return updated;
//     //     });
//     // };

//     // const updateAlertTime = (phaseIdx, oldTime, newTime) => {
//     //     if (!state.editMode) return;

//     //     updateFormData(currentFormData => {
//     //         const updated = { ...currentFormData };

//     //         if (updated.config.phases[phaseIdx].alerts[newTime]) {
//     //             setState(prev => ({ ...prev, error: `זמן ${newTime} כבר קיים בפאזה זו` }));
//     //             return currentFormData; // Return unchanged
//     //         }

//     //         const methods = updated.config.phases[phaseIdx].alerts[oldTime];
//     //         updated.config.phases[phaseIdx].alerts[newTime] = [...methods];
//     //         delete updated.config.phases[phaseIdx].alerts[oldTime];

//     //         setState(prev => ({ ...prev, error: "" }));
//     //         return updated;
//     //     });
//     // };

//     const updateAlertTime = (phaseIdx, oldTime, newTime) => {
//         if (!state.editMode) return;

//         updateFormData(currentFormData => {
//             const updated = { ...currentFormData };

//             // Ensure both old and new times are different and properly formatted
//             if (oldTime === newTime) {
//                 return currentFormData; // No change needed
//             }

//             // Check if the new time already exists
//             if (updated.config.phases[phaseIdx].alerts[newTime]) {
//                 setState(prev => ({ ...prev, error: `זמן ${newTime} כבר קיים בפאזה זו` }));
//                 return currentFormData; // Return unchanged
//             }

//             // Verify that the old time exists before trying to update
//             if (!updated.config.phases[phaseIdx].alerts[oldTime]) {
//                 setState(prev => ({ ...prev, error: `שגיאה בעדכון זמן: זמן ${oldTime} לא קיים` }));
//                 return currentFormData;
//             }

//             // Copy the methods from old time to new time
//             const methods = [...updated.config.phases[phaseIdx].alerts[oldTime]];
//             updated.config.phases[phaseIdx].alerts[newTime] = methods;

//             // Delete the old time entry
//             delete updated.config.phases[phaseIdx].alerts[oldTime];

//             setState(prev => ({ ...prev, error: "" }));
//             return updated;
//         });
//     };

//     const updatePhaseProperty = (phaseIdx, property, value) => {
//         if (!state.editMode) return;

//         if (property === "start_day") {
//             // Allow any input temporarily during typing
//             updateFormData(currentFormData => {
//                 const updated = { ...currentFormData };
//                 updated.config.phases[phaseIdx][property] = value;
//                 return updated;
//             });
//         } else {
//             // For other properties, validate immediately
//             validateAndUpdateProperty(phaseIdx, property, value);
//         }
//     };

//     // Add this new function
//     const validateAndUpdateProperty = (phaseIdx, property, value) => {
//         updateFormData(currentFormData => {
//             const updated = { ...currentFormData };
//             const phases = updated.config.phases;

//             if (property === "start_day") {
//                 value = parseInt(value, 10);
//                 if (isNaN(value) || value < 0) {
//                     setState(prev => ({ ...prev, error: "יום התחלה חייב להיות מספר חיובי" }));
//                     return currentFormData;
//                 }

//                 // Validate phase order
//                 if ((phaseIdx > 0 && value <= phases[phaseIdx - 1].start_day) ||
//                     (phaseIdx < phases.length - 1 && value >= phases[phaseIdx + 1].start_day)) {
//                     setState(prev => ({ ...prev, error: "יום התחלה מפר את סדר הפאזות" }));
//                     return currentFormData;
//                 }
//             }

//             if (property === "repeat_interval") {
//                 if (value === "" || value === "null") {
//                     value = null;
//                 } else {
//                     value = parseInt(value, 10);
//                     if (isNaN(value) || value < 1) {
//                         setState(prev => ({ ...prev, error: "מרווח חזרה חייב להיות מספר חיובי" }));
//                         return currentFormData;
//                     }
//                 }
//             }

//             updated.config.phases[phaseIdx][property] = value;
//             setState(prev => ({ ...prev, error: "" }));
//             return updated;
//         });
//     };
//     // Render components
//     const renderMethodsList = (phaseIdx, time, methods) => {
//         if (state.editMode) {
//             return (
//                 <div className="playbook-page-method-selector">
//                     <div className="playbook-page-method-chips">
//                         {methods.map((method, idx) => (
//                             <div key={idx} className="playbook-page-method-chip">
//                                 <span className="playbook-page-method-name">{methodOptions[method] || method}</span>
//                                 <button
//                                     className="playbook-page-method-remove"
//                                     onClick={() => handleMethod(phaseIdx, time, method, false)}
//                                     aria-label="הסר שיטת התראה"
//                                 >
//                                     ×
//                                 </button>
//                             </div>
//                         ))}
//                     </div>

//                     {methods.length < Object.keys(methodOptions).length && (
//                         <div className="playbook-page-method-dropdown">
//                             <button
//                                 className="playbook-page-add-method-btn"
//                                 onClick={() => {
//                                     const dropdownId = `${phaseIdx}-${time}`;
//                                     setState(prev => ({
//                                         ...prev,
//                                         activeDropdown: prev.activeDropdown === dropdownId ? null : dropdownId
//                                     }));
//                                 }}
//                             >
//                                 <span className="playbook-page-add-icon">+</span> הוסף התראה
//                             </button>
//                             {state.activeDropdown === `${phaseIdx}-${time}` && (
//                                 <div className="playbook-page-method-dropdown-content">
//                                     {Object.entries(methodOptions)
//                                         .filter(([method]) => !methods.includes(method))
//                                         .map(([method, label], idx) => (
//                                             <div
//                                                 key={idx}
//                                                 className="playbook-page-method-option"
//                                                 onClick={() => {
//                                                     handleMethod(phaseIdx, time, method, true);
//                                                     setState(prev => ({ ...prev, activeDropdown: null }));
//                                                 }}
//                                             >
//                                                 {label}
//                                             </div>
//                                         ))
//                                     }
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             );
//         }

//         return (
//             <div className="playbook-page-methods-list">
//                 {methods.map((method, idx) => (
//                     <span key={idx} className="playbook-page-method-badge">
//                         {methodOptions[method] || method}
//                     </span>
//                 ))}
//             </div>
//         );
//     };

//     // This function should be called after any time changes to ensure proper rendering order
//     const renderAlerts = (phase, phaseIdx) => (
//         <div className="playbook-page-alerts-container">
//             {Object.entries(phase.alerts)
//                 .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
//                 .map(([time, methods], timeIdx) => (
//                     <div key={timeIdx} className="playbook-page-alert-item">
//                         {state.editMode ? (
//                             <div className="playbook-page-time-selectors">
//                                 <select
//                                     className="playbook-page-minute-select"
//                                     value={time.split(':')[1]}
//                                     onChange={(e) => {
//                                         const newTime = `${time.split(':')[0]}:${e.target.value}`;
//                                         updateAlertTime(phaseIdx, time, newTime);
//                                     }}
//                                     aria-label="דקות"
//                                 >
//                                     {['00', '15', '30', '45'].map((min) => (
//                                         <option key={min} value={min}>{min}</option>
//                                     ))}
//                                 </select>
//                                 <span className="playbook-page-time-separator">:</span>
//                                 <select
//                                     className="playbook-page-hour-select"
//                                     value={time.split(':')[0]}
//                                     onChange={(e) => {
//                                         const newTime = `${e.target.value.padStart(2, '0')}:${time.split(':')[1]}`;
//                                         updateAlertTime(phaseIdx, time, newTime);
//                                     }}
//                                     aria-label="שעה"
//                                 >
//                                     {Array.from({ length: 24 }, (_, i) => (
//                                         <option key={i} value={i.toString().padStart(2, '0')}>
//                                             {i.toString().padStart(2, '0')}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         ) : (
//                             <div className="playbook-page-alert-time">{time}</div>
//                         )}

//                         {renderMethodsList(phaseIdx, time, methods)}
//                     </div>
//                 ))}

//             {state.editMode && (
//                 <button
//                     className="playbook-page-add-alert-btn"
//                     onClick={() => addAlertTime(phaseIdx)}
//                     disabled={Object.keys(phase.alerts).some(time => time >= "23:00")}
//                 >
//                     <span className="playbook-page-add-icon">+</span> הוסף זמן התראה
//                 </button>
//             )}
//         </div>
//     );



//     const renderPhases = () => {
//         if (!state.formData?.config?.phases) return null;

//         return state.formData.config.phases.map((phase, idx) => (
//             <div key={idx} className="playbook-page-phase-card">
//                 <div className="playbook-page-phase-header">
//                     <div className="playbook-page-phase-title-container">
//                         <div className="playbook-page-phase-badge">{idx + 1}</div>
//                         <h3 className="playbook-page-phase-title">תקופת התראות {idx + 1}</h3>
//                     </div>
//                     {state.editMode && idx > 0 && (
//                         <button
//                             className="playbook-page-remove-phase-btn"
//                             onClick={() => removePhase(idx)}
//                             aria-label="הסר תקופה"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <polyline points="3 6 5 6 21 6"></polyline>
//                                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//                             </svg>
//                             הסר תקופה
//                         </button>
//                     )}
//                 </div>

//                 <div className="playbook-page-phase-details">
//                     <div className="playbook-page-phase-property">
//                         <label className="playbook-page-property-label">יום התחלה:</label>
//                         {state.editMode ? (
//                             <input
//                                 type="number"
//                                 className="playbook-page-property-input"
//                                 value={phase.start_day}
//                                 onChange={(e) => updatePhaseProperty(idx, "start_day", e.target.value)}
//                                 onBlur={(e) => validateAndUpdateProperty(idx, "start_day", e.target.value)}
//                                 min="0"
//                                 aria-label="יום התחלה"
//                             />
//                         ) : (
//                             <span className="playbook-page-property-value">{phase.start_day}</span>
//                         )}
//                     </div>

//                     <div className="playbook-page-phase-property">
//                         <label className="playbook-page-property-label">חזרות:</label>
//                         {state.editMode ? (
//                             <select
//                                 className="playbook-page-property-select"
//                                 value={phase.repeat_interval === null ? "null" : phase.repeat_interval}
//                                 onChange={(e) => updatePhaseProperty(idx, "repeat_interval", e.target.value)}
//                                 aria-label="מרווח חזרה"
//                             >
//                                 <option value="null">חד פעמי</option>
//                                 {[1, 2, 3, 5, 7, 14, 30].map(val => (
//                                     <option key={val} value={val}>
//                                         כל {val} {val === 1 ? 'יום' : 'ימים'}
//                                     </option>
//                                 ))}
//                             </select>
//                         ) : (
//                             <span className="playbook-page-property-value">
//                                 {phase.repeat_interval === null
//                                     ? "חד פעמי"
//                                     : `כל ${phase.repeat_interval} ${phase.repeat_interval === 1 ? 'יום' : 'ימים'}`}
//                             </span>
//                         )}
//                     </div>
//                 </div>

//                 <div className="playbook-page-phase-alerts">
//                     <h4 className="playbook-page-alerts-title">זמני התראות</h4>
//                     {renderAlerts(phase, idx)}
//                 </div>
//             </div>
//         ));
//     };

//     const renderTargetInfo = () => {
//         if (!state.playbook) return null;
//         const { playbook } = state;

//         if (playbook.document) {
//             return (
//                 <div className="playbook-page-target-info document">
//                     <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//                         <polyline points="14 2 14 8 20 8"></polyline>
//                         <line x1="16" y1="13" x2="8" y2="13"></line>
//                         <line x1="16" y1="17" x2="8" y2="17"></line>
//                         <polyline points="10 9 9 9 8 9"></polyline>
//                     </svg>
//                     <span className="playbook-page-target-label">מסמך:</span>
//                     <a
//                         href="#"
//                         className="playbook-page-target-link"
//                         onClick={(e) => { e.preventDefault(); alert("צפייה במסמך אינה מיושמת עדיין"); }}
//                     >
//                         {playbook.document.provider_doc_id}
//                     </a>
//                 </div>
//             );
//         } else if (playbook.client) {
//             return (
//                 <div className="playbook-page-target-info client">
//                     <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//                         <circle cx="12" cy="7" r="4"></circle>
//                     </svg>
//                     <span className="playbook-page-target-label">לקוח:</span>
//                     <a
//                         href="#"
//                         className="playbook-page-target-link"
//                         onClick={(e) => { e.preventDefault(); alert("צפייה בלקוח אינה מיושמת עדיין"); }}
//                     >
//                         {playbook.client.name}
//                     </a>
//                 </div>
//             );
//         } else {
//             return (
//                 <div className="playbook-page-target-info global">
//                     <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <circle cx="12" cy="12" r="10"></circle>
//                         <line x1="2" y1="12" x2="22" y2="12"></line>
//                         <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
//                     </svg>
//                     <span className="playbook-page-target-label">פלייבוק גלובלי</span>
//                 </div>
//             );
//         }
//     };

//     if (state.loading) {
//         return (
//             <div className="playbook-page-loading-container">
//                 <div className="playbook-page-spinner"></div>
//                 <span>טוען פלייבוק...</span>
//             </div>
//         );
//     }

//     if (!state.playbook || !state.formData) {
//         return <div className="playbook-page-error-message">שגיאה בטעינת נתוני הפלייבוק</div>;
//     }



//     return (
//         <div className="playbook-page-container">
//             <div className="playbook-page-header">
//                 <div className="playbook-page-header-content">
//                     <div className="playbook-page-title-section">
//                         <h1 className="playbook-page-title">פלייבוק</h1>
//                         {renderTargetInfo()}
//                     </div>

//                     <div className="playbook-page-actions">
//                         {!state.editMode ? (
//                             <>
//                                 {(state.playbook.document || state.playbook.client) && (
//                                     <button
//                                         className="playbook-page-remove-btn"
//                                         onClick={() => alert("הסרת פלייבוק אינה מיושמת עדיין")}
//                                     >
//                                         הסר פלייבוק
//                                     </button>
//                                 )}
//                                 <button
//                                     className="playbook-page-edit-btn"
//                                     onClick={() => setState(prev => ({ ...prev, editMode: true }))}
//                                 >
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                         <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
//                                     </svg>
//                                     ערוך התראות
//                                 </button>
//                             </>
//                         ) : (
//                             <div className="playbook-page-editing-actions">
//                                 <button
//                                     className="playbook-page-save-btn"
//                                     onClick={handleSave}
//                                     disabled={state.saving}
//                                 >
//                                     {state.saving ? (
//                                         <>
//                                             <div className="playbook-page-spinner-small"></div>
//                                             שומר...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                 <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
//                                                 <polyline points="17 21 17 13 7 13 7 21"></polyline>
//                                                 <polyline points="7 3 7 8 15 8"></polyline>
//                                             </svg>
//                                             שמור שינויים
//                                         </>
//                                     )}
//                                 </button>
//                                 <button
//                                     className="playbook-page-cancel-btn"
//                                     onClick={handleCancel}
//                                     disabled={state.saving}
//                                 >
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                         <line x1="18" y1="6" x2="6" y2="18"></line>
//                                         <line x1="6" y1="6" x2="18" y2="18"></line>
//                                     </svg>
//                                     בטל
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {state.error && (
//                     <div className="playbook-page-error-message">
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                             <circle cx="12" cy="12" r="10"></circle>
//                             <line x1="12" y1="8" x2="12" y2="12"></line>
//                             <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                         </svg>
//                         {state.error}
//                     </div>
//                 )}
//             </div>

//             <div className="playbook-page-content">
//                 <div className="playbook-page-settings-section">
//                     <div className="playbook-page-business-days">
//                         <label className="playbook-page-option-label">
//                             התראות רק בימי עסקים:
//                         </label>
//                         {state.editMode ? (
//                             <label className="playbook-page-toggle">
//                                 <input
//                                     type="checkbox"
//                                     checked={state.formData.only_business_days}
//                                     onChange={(e) => updateFormData(current => ({
//                                         ...current,
//                                         only_business_days: e.target.checked,
//                                     }))}
//                                 />
//                                 <span className="playbook-page-toggle-slider"></span>
//                             </label>
//                         ) : (
//                             <span className="playbook-page-option-value">
//                                 {state.playbook.only_business_days ? "כן" : "לא"}
//                             </span>
//                         )}
//                     </div>
//                 </div>

//                 <div className="playbook-page-phases-section">
//                     <div className="playbook-page-section-header">
//                         <h2 className="playbook-page-section-title">הגדרת התראות</h2>
//                         {/* {state.editMode && (
//                             <button
//                                 className="playbook-page-add-phase-btn"
//                                 onClick={addPhase}
//                             >
//                                 <span className="playbook-page-add-icon">+</span> הוסף תקופה חדשה
//                             </button>
//                         )} */}
//                     </div>

//                     <div className="playbook-page-phases-container">
//                         {renderPhases()}
//                     </div>
//                     {state.editMode && (
//                         <button
//                             className="playbook-page-add-phase-btn"
//                             onClick={addPhase}
//                         >
//                             <span className="playbook-page-add-icon">+</span> הוסף תקופה חדשה
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {state.showConfirmation && (
//                 <div className="playbook-page-confirmation-overlay">
//                     <div className="playbook-page-confirmation-dialog">
//                         <h3 className="playbook-page-confirmation-title">אישור פעולה</h3>
//                         <p className="playbook-page-confirmation-message">{state.confirmMessage}</p>
//                         <div className="playbook-page-confirmation-actions">
//                             <button
//                                 className="playbook-page-confirm-btn"
//                                 onClick={executeConfirmedAction}
//                             >
//                                 אישור
//                             </button>
//                             <button
//                                 className="playbook-page-cancel-btn"
//                                 onClick={() => setState(prev => ({ ...prev, showConfirmation: false }))}
//                             >
//                                 ביטול
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

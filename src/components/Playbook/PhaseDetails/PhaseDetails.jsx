import React, { useState } from "react";
import "./PhaseDetails.css";

const PhaseDetails = ({ phase, phaseIdx, editMode, updatePhaseProperty }) => {
    // State to track validation errors
    const [errors, setErrors] = useState({
        start_day: null,
        repeat_interval: null
    });

    // Handle input change without validation to allow free typing
    const handleInputChange = (e, field) => {
        // Only update the UI state during typing, without validation
        const result = updatePhaseProperty(field, e.target.value, false, phaseIdx);
        // Clear any existing error for this field during typing
        if (errors[field]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: null
            }));
        }
    };

    const handleBlur = (e, field) => {
        // Get the error message directly (no await needed)
        const result = updatePhaseProperty(field, e.target.value, true);
        
        // Handle the error message
        if (result && result !== "none") {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: result
            }));
        } else {
            setErrors(prevErrors => ({
                ...prevErrors,
                [field]: null
            }));
        }
    };

    return (
        <div className="playbook-page-phase-details">
            <div className="playbook-page-phase-property">
                <div className="label-with-tooltip">
                    <label className="playbook-page-property-label">יום התחלה:</label>
                    <div className="tooltip-container">
                        <span className="tooltip-icon">?</span>
                        <span className="tooltip-text">מספר הימים מתאריך הפירעון של מסמך התשלום</span>
                    </div>
                </div>
                {editMode ? (
                    <div className="phase-details-input-wrapper">
                        <input
                            type="number"
                            className="playbook-page-property-input"
                            value={phase.start_day}
                            onChange={(e) => handleInputChange(e, "start_day")}
                            onBlur={(e) => handleBlur(e, "start_day")}
                            min="0"
                            aria-label="יום התחלה"
                        />
                        {errors.start_day && (
                            <div className="phase-details-error-message">{errors.start_day}</div>
                        )}
                    </div>
                ) : (
                    <span className="playbook-page-property-value">{phase.start_day}</span>
                )}
            </div>
            <div className="playbook-page-phase-property">
                <label className="playbook-page-property-label">חזרות:</label>
                {editMode ? (
                    <div className="phase-details-input-wrapper">
                        <select
                            className="playbook-page-property-select"
                            value={phase.repeat_interval === null ? "null" : phase.repeat_interval}
                            onChange={(e) => handleInputChange(e, "repeat_interval")}
                            onBlur={(e) => handleBlur(e, "repeat_interval")}
                            aria-label="מרווח חזרה"
                        >
                            <option value="null">חד פעמי</option>
                            {[1, 2, 3, 5, 7, 10, 14, 20, 30].map(val => (
                                <option key={val} value={val}>
                                    כל {val} {val === 1 ? 'יום' : 'ימים'}
                                </option>
                            ))}
                        </select>
                        {errors.repeat_interval && (
                            <div className="phase-details-error-message">{errors.repeat_interval}</div>
                        )}
                    </div>
                ) : (
                    <span className="playbook-page-property-value">
                        {phase.repeat_interval === null
                            ? "חד פעמי"
                            : `כל ${phase.repeat_interval} ${phase.repeat_interval === 1 ? 'יום' : 'ימים'}`}
                    </span>
                )}
            </div>
        </div>
    );
};

export default PhaseDetails;
// import "./PhaseDetails.css"

// const PhaseDetails = ({ phase, phaseIdx, editMode, updatePhaseProperty }) => {
//     // Handle input change without validation to allow free typing
//     const handleInputChange = (e) => {
//         // Only update the UI state during typing, without validation
//         updatePhaseProperty("start_day", e.target.value, false);
//     };

//     // Validate on blur when user has finished typing
//     const handleBlur = (e) => {
//         // Perform validation only when focus leaves the input
//         updatePhaseProperty("start_day", e.target.value, true);
//     };

//     return (
//         <div className="playbook-page-phase-details">
//             <div className="playbook-page-phase-property">
//                 <div className="label-with-tooltip">
//                     <label className="playbook-page-property-label">יום התחלה:</label>
//                     <div className="tooltip-container">
//                         <span className="tooltip-icon">?</span>
//                         <span className="tooltip-text">מספר הימים מתאריך הפירעון של מסמך התשלום</span>
//                     </div>
//                 </div>
//                 {editMode ? (
//                     <input
//                         type="number"
//                         className="playbook-page-property-input"
//                         value={phase.start_day}
//                         onChange={handleInputChange}
//                         onBlur={handleBlur}
//                         min="0"
//                         aria-label="יום התחלה"
//                     />
//                 ) : (
//                     <span className="playbook-page-property-value">{phase.start_day}</span>
//                 )}
//             </div>

//             <div className="playbook-page-phase-property">
//                 <label className="playbook-page-property-label">חזרות:</label>
//                 {editMode ? (
//                     <select
//                         className="playbook-page-property-select"
//                         value={phase.repeat_interval === null ? "null" : phase.repeat_interval}
//                         // onChange={(e) => updatePhaseProperty("repeat_interval", e.target.value, true)}
//                         onChange={(e) => updatePhaseProperty("start_day", e.target.value, false)}
//                         onBlur={(e) => updatePhaseProperty("start_day", e.target.value, true)}
//                         aria-label="מרווח חזרה"
//                     >
//                         <option value="null">חד פעמי</option>
//                         {[1, 2, 3, 5, 7, 10, 14, 20, 30].map(val => (
//                             <option key={val} value={val}>
//                                 כל {val} {val === 1 ? 'יום' : 'ימים'}
//                             </option>
//                         ))}
//                     </select>
//                 ) : (
//                     <span className="playbook-page-property-value">
//                         {phase.repeat_interval === null
//                             ? "חד פעמי"
//                             : `כל ${phase.repeat_interval} ${phase.repeat_interval === 1 ? 'יום' : 'ימים'}`}
//                     </span>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PhaseDetails
// // import "./PhaseDetails.css"

// // const PhaseDetails = ({ phase, phaseIdx, editMode, updatePhaseProperty }) => {
// //     return (
// //         <div className="playbook-page-phase-details">
// //             <div className="playbook-page-phase-property">
// //                 <div className="label-with-tooltip">
// //                     <label className="playbook-page-property-label">יום התחלה:</label>
// //                     <div className="tooltip-container">
// //                         <span className="tooltip-icon">?</span>
// //                         <span className="tooltip-text">מספר הימים מתאריך הפירעון של מסמך התשלום</span>
// //                     </div>
// //                 </div>
// //                 {editMode ? (
// //                     <input
// //                         type="number"
// //                         className="playbook-page-property-input"
// //                         value={phase.start_day}
// //                         onChange={(e) => updatePhaseProperty("start_day", e.target.value)}
// //                         onBlur={(e) => updatePhaseProperty("start_day", e.target.value)}
// //                         min="0"
// //                         aria-label="יום התחלה"
// //                     />
// //                 ) : (
// //                     <span className="playbook-page-property-value">{phase.start_day}</span>
// //                 )}
// //             </div>

// //             <div className="playbook-page-phase-property">
// //                 <label className="playbook-page-property-label">חזרות:</label>
// //                 {editMode ? (
// //                     <select
// //                         className="playbook-page-property-select"
// //                         value={phase.repeat_interval === null ? "null" : phase.repeat_interval}
// //                         onChange={(e) => updatePhaseProperty("repeat_interval", e.target.value)}
// //                         aria-label="מרווח חזרה"
// //                     >
// //                         <option value="null">חד פעמי</option>
// //                         {[1, 2, 3, 5, 7, 10, 14, 20, 30].map(val => (
// //                             <option key={val} value={val}>
// //                                 כל {val} {val === 1 ? 'יום' : 'ימים'}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 ) : (
// //                     <span className="playbook-page-property-value">
// //                         {phase.repeat_interval === null
// //                             ? "חד פעמי"
// //                             : `כל ${phase.repeat_interval} ${phase.repeat_interval === 1 ? 'יום' : 'ימים'}`}
// //                     </span>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default PhaseDetails
// // // const PhaseDetails = ({ phase, phaseIdx, editMode, updatePhaseProperty }) => {
// // //     return (
// // //         <div className="playbook-page-phase-details">
// // //             <div className="playbook-page-phase-property">
                
// // //                 <label className="playbook-page-property-label" title="מספר הימים מתאריך הפירעון של מסמך התשלום">יום התחלה:</label>
// // //                 {editMode ? (
// // //                     <input
// // //                         type="number"
// // //                         className="playbook-page-property-input"
// // //                         value={phase.start_day}
// // //                         onChange={(e) => updatePhaseProperty("start_day", e.target.value)}
// // //                         onBlur={(e) => updatePhaseProperty("start_day", e.target.value)}
// // //                         min="0"
// // //                         aria-label="יום התחלה"
// // //                     />
// // //                 ) : (
// // //                     <span className="playbook-page-property-value">{phase.start_day}</span>
// // //                 )}
// // //             </div>

// // //             <div className="playbook-page-phase-property">
// // //                 <label className="playbook-page-property-label">חזרות:</label>
// // //                 {editMode ? (
// // //                     <select
// // //                         className="playbook-page-property-select"
// // //                         value={phase.repeat_interval === null ? "null" : phase.repeat_interval}
// // //                         onChange={(e) => updatePhaseProperty("repeat_interval", e.target.value)}
// // //                         aria-label="מרווח חזרה"
// // //                     >
// // //                         <option value="null">חד פעמי</option>
// // //                         {[1, 2, 3, 5, 7, 14, 30].map(val => (
// // //                             <option key={val} value={val}>
// // //                                 כל {val} {val === 1 ? 'יום' : 'ימים'}
// // //                             </option>
// // //                         ))}
// // //                     </select>
// // //                 ) : (
// // //                     <span className="playbook-page-property-value">
// // //                         {phase.repeat_interval === null
// // //                             ? "חד פעמי"
// // //                             : `כל ${phase.repeat_interval} ${phase.repeat_interval === 1 ? 'יום' : 'ימים'}`}
// // //                     </span>
// // //                 )}
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default PhaseDetails
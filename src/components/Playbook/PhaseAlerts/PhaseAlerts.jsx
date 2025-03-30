import { useState } from "react";
import AlertItem from "../AlertItem/AlertItem";
import "./PhaseAlerts.css"

const PhaseAlerts = ({ phase, phaseIdx, editMode, updateFormData, addAlertTime }) => {
    const [timeError, setTimeError] = useState(false);
    
    const updateAlertTime = (oldTime, newTime) => {
        const allTimes = Object.keys(phase.alerts).filter(t => t !== oldTime);
        const isBeforePrevious = allTimes.some(t => newTime < t);

        if (isBeforePrevious) {
            setTimeError(true);
            return;
        }

        setTimeError(false);
        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const phase = updated.config.phases[phaseIdx];

            if (oldTime !== newTime && !phase.alerts[newTime]) {
                const methods = phase.alerts[oldTime];
                phase.alerts[newTime] = [...methods];
                delete phase.alerts[oldTime];
            }

            return updated;
        });
    };

    const removeAlertTime = (time) => {
        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const phase = updated.config.phases[phaseIdx];
            
            delete phase.alerts[time];
            
            return updated;
        });
    };

    return (
        <div className="playbook-page-phase-alerts">
           
            <h4 className="playbook-page-alerts-title">זמני התראות</h4>
            <div className="playbook-page-alerts-container">
                {Object.entries(phase.alerts)
                    .map(([time, methods], timeIdx) => (
                        <AlertItem
                            key={timeIdx}
                            time={time}
                            methods={methods}
                            phaseIdx={phaseIdx}
                            editMode={editMode}
                            updateAlertTime={(newTime) => updateAlertTime(time, newTime)}
                            updateFormData={updateFormData}
                            removeAlertTime={removeAlertTime}
                        />
                    ))}
                 {timeError && (
                <div className="phase-alerts-error">
                    לא ניתן להגדיר זמן התראה מוקדם יותר מזמן קיים
                </div>
            )}
                {editMode && (
                    <button
                        className="playbook-page-add-alert-btn"
                        onClick={addAlertTime}
                        disabled={Object.keys(phase.alerts).some(time => time >= "23:00")}
                    >
                        <span className="playbook-page-add-icon">+</span> הוסף זמן התראה
                    </button>
                                        
                )}
                
            </div>
        </div>
    );
};

export default PhaseAlerts
// import { useState } from "react";
// import AlertItem from "../AlertItem/AlertItem";
// import "./PhaseAlerts.css"

// const PhaseAlerts = ({ phase, phaseIdx, editMode, updateFormData, addAlertTime }) => {
//     const [timeError, setTimeError] = useState(false);
//     const updateAlertTime = (oldTime, newTime) => {
//         // Check if new time is before any existing time
//         const allTimes = Object.keys(phase.alerts).filter(t => t !== oldTime);
//         const isBeforePrevious = allTimes.some(t => newTime < t);

//         if (isBeforePrevious) {
//             // Show error message
//             setTimeError(true);
//             return;
//         }

//         setTimeError(false);
//         updateFormData(currentFormData => {
//             const updated = { ...currentFormData };
//             const phase = updated.config.phases[phaseIdx];

//             if (oldTime !== newTime && !phase.alerts[newTime]) {
//                 const methods = phase.alerts[oldTime];
//                 phase.alerts[newTime] = [...methods];
//                 delete phase.alerts[oldTime];
//             }

//             return updated;
//         });
//     };
//     // const updateAlertTime = (oldTime, newTime) => {
//     //     updateFormData(currentFormData => {
//     //         const updated = { ...currentFormData };
//     //         const phase = updated.config.phases[phaseIdx];

//     //         if (oldTime !== newTime && !phase.alerts[newTime]) {
//     //             const methods = phase.alerts[oldTime];
//     //             phase.alerts[newTime] = [...methods];
//     //             delete phase.alerts[oldTime];
//     //         }

//     //         return updated;
//     //     });                
//     // };

//     return (
//         <div className="playbook-page-phase-alerts">
           
//             <h4 className="playbook-page-alerts-title">זמני התראות</h4>
//             <div className="playbook-page-alerts-container">
//                 {Object.entries(phase.alerts)
//                     // .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
//                     .map(([time, methods], timeIdx) => (
//                         <AlertItem
//                             key={timeIdx}
//                             time={time}
//                             methods={methods}
//                             phaseIdx={phaseIdx}
//                             editMode={editMode}
//                             updateAlertTime={(newTime) => updateAlertTime(time, newTime)}
//                             updateFormData={updateFormData}
//                         />
//                     ))}
//                  {timeError && (
//                 <div className="phase-alerts-error">
//                     לא ניתן להגדיר זמן התראה מוקדם יותר מזמן קיים
//                 </div>
//             )}
//                 {editMode && (
//                     <button
//                         className="playbook-page-add-alert-btn"
//                         onClick={addAlertTime}
//                         disabled={Object.keys(phase.alerts).some(time => time >= "23:00")}
//                     >
//                         <span className="playbook-page-add-icon">+</span> הוסף זמן התראה
//                     </button>
                                        
//                 )}
                
//             </div>
//         </div>
//     );
// };

// export default PhaseAlerts
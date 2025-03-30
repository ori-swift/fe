import { useState } from "react";
import AlertItem from "../AlertItem/AlertItem";
import "./PhaseAlerts.css"

const PhaseAlerts = ({ phase, phaseIdx, editMode, updateFormData, addAlertTime }) => {
    const [timeError, setTimeError] = useState(false);
    
    const updateAlertTime = (oldTime, newTime) => {
        setTimeError(false);
        
        // If time hasn't changed, do nothing
        if (oldTime === newTime) {
            return;
        }
        
        // Get all alert times for the phase
        const alertTimes = Object.keys(phase.alerts);
        
        // Check if the new time already exists
        if (alertTimes.includes(newTime)) {
            setTimeError(true);
            return;
        }
        
        // Find the previous and next times relative to the old time position
        const oldIndex = alertTimes.indexOf(oldTime);
        const prevTime = oldIndex > 0 ? alertTimes[oldIndex - 1] : null;
        const nextTime = oldIndex < alertTimes.length - 1 ? alertTimes[oldIndex + 1] : null;
        
        // Check if new time would violate ascending order
        if ((prevTime && newTime < prevTime) || (nextTime && newTime > nextTime)) {
            setTimeError(true);
            return;
        }

        updateFormData(currentFormData => {
            const updated = { ...currentFormData };
            const phase = updated.config.phases[phaseIdx];
            
            const methods = [...phase.alerts[oldTime]];
            
            // Create a new alerts object with sorted keys
            const newAlerts = {};
            const allTimes = [...Object.keys(phase.alerts).filter(t => t !== oldTime), newTime].sort();
            
            // Populate the new alerts object in sorted order
            allTimes.forEach(time => {
                if (time === newTime) {
                    newAlerts[time] = methods;
                } else {
                    newAlerts[time] = phase.alerts[time];
                }
            });
            
            // Replace the entire alerts object
            phase.alerts = newAlerts;
            
            return updated;
        });
        // // Update the form data with the new time
        // updateFormData(currentFormData => {
        //     const updated = { ...currentFormData };
        //     const phase = updated.config.phases[phaseIdx];
            
        //     // Copy methods from old time to new time
        //     const methods = [...phase.alerts[oldTime]];
        //     phase.alerts[newTime] = methods;
            
        //     // Remove old time
        //     delete phase.alerts[oldTime];
            
        //     return updated;
        // });
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
                    .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
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
//         // Get all times from this phase except the one being changed
//         const allTimes = Object.keys(phase.alerts).filter(t => t !== oldTime);
        
//         // Check if the new time already exists in the alerts
//         if (allTimes.includes(newTime)) {
//             setTimeError(true);
//             return;
//         }
        
//         // Get all times sorted for sequential validation
//         const sortedTimes = [...allTimes].sort();
        
//         // Determine where the old time fits in the sequence
//         const oldTimePosition = sortedTimes.findIndex(t => t > oldTime);
        
//         // Identify the time constraints (the time before and after)
//         const previousTime = oldTimePosition > 0 ? sortedTimes[oldTimePosition - 1] : null;
//         const nextTime = oldTimePosition !== -1 ? sortedTimes[oldTimePosition] : null;
        
//         // Check if the new time would violate the sequence
//         if ((previousTime && newTime < previousTime) || (nextTime && newTime > nextTime)) {
//             setTimeError(true);
//             return;
//         }
        
//         // If we passed all checks, clear any previous errors
//         setTimeError(false);
        
//         // Update the data
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
//     //     const allTimes = Object.keys(phase.alerts).filter(t => t !== oldTime);
//     //     const isBeforePrevious = allTimes.some(t => newTime < t);

//     //     if (isBeforePrevious) {
//     //         setTimeError(true);
//     //         return;
//     //     }

//     //     setTimeError(false);
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

//     const removeAlertTime = (time) => {
//         updateFormData(currentFormData => {
//             const updated = { ...currentFormData };
//             const phase = updated.config.phases[phaseIdx];
            
//             delete phase.alerts[time];
            
//             return updated;
//         });
//     };

//     return (
//         <div className="playbook-page-phase-alerts">
           
//             <h4 className="playbook-page-alerts-title">זמני התראות</h4>
//             <div className="playbook-page-alerts-container">
//                 {Object.entries(phase.alerts)
//                     .map(([time, methods], timeIdx) => (
//                         <AlertItem
//                             key={timeIdx}
//                             time={time}
//                             methods={methods}
//                             phaseIdx={phaseIdx}
//                             editMode={editMode}
//                             updateAlertTime={(newTime) => updateAlertTime(time, newTime)}
//                             updateFormData={updateFormData}
//                             removeAlertTime={removeAlertTime}
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

const TimeSelector = ({ time, onChange }) => {
    return (
        <div className="playbook-page-time-selectors">
            <select
                className="playbook-page-minute-select"
                value={time.split(':')[1]}
                onChange={(e) => {
                    const newTime = `${time.split(':')[0]}:${e.target.value}`;
                    onChange(newTime);
                }}
                aria-label="דקות"
            >
                {['00', '15', '30', '45'].map((min) => (
                    <option key={min} value={min}>{min}</option>
                ))}
            </select>
            <span className="playbook-page-time-separator">:</span>
            <select
                className="playbook-page-hour-select"
                value={time.split(':')[0]}
                onChange={(e) => {
                    const newTime = `${e.target.value.padStart(2, '0')}:${time.split(':')[1]}`;
                    onChange(newTime);
                }}
                aria-label="שעה"
            >
                {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TimeSelector
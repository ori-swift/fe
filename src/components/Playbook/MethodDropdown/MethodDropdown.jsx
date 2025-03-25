const MethodDropdown = ({ methods, methodOptions, onSelect, isOpen, toggle }) => {
    return (
        <div className="playbook-page-method-dropdown">
            <button className="playbook-page-add-method-btn" onClick={toggle}>
                <span className="playbook-page-add-icon">+</span> הוסף התראה
            </button>
            {isOpen && (
                <div className="playbook-page-method-dropdown-content">
                    {Object.entries(methodOptions)
                        .filter(([method]) => !methods.includes(method))
                        .map(([method, label], idx) => (
                            <div
                                key={idx}
                                className="playbook-page-method-option"
                                onClick={() => {
                                    onSelect(method);
                                    toggle();
                                }}
                            >
                                {label}
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
};

export default MethodDropdown
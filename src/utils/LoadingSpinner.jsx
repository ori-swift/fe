const LoadingSpinner = ({ message }) => {
    return (
        <div className="playbook-page-loading-container">
            <div className="playbook-page-spinner"></div>
            <span>{message}</span>
        </div>
    );
};

export default LoadingSpinner
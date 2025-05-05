import React, { useState } from "react";
import { getDocumentPdfLink } from "../../api/documents_api";
import "./DocumentPdfViewer.css";

const DocumentPdfViewer = ({ docId }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await getDocumentPdfLink(docId);
      const link = document.createElement("a");
      link.href = res.pdf_link;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.errorMsg || "Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documentpdfviewer-container">
      <button
        className="documentpdfviewer-button"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? "Downloading..." : "Download Doc"}
      </button>
    </div>
  );
};

export default DocumentPdfViewer;

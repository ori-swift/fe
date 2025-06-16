import React, { useState, useEffect, useRef } from 'react';
import { Form, Dropdown, Button } from 'react-bootstrap';
import './SmartTemplateEditor.css';
import { getTemplateVars } from '../../../api/alerts_api';

const SmartTemplateEditor = ({ value, onChange, readOnly = false }) => {
  const [content, setContent] = useState(value || '');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [variables, setVariables] = useState([]);
  const [showVarDropdown, setShowVarDropdown] = useState(false);
  const textareaRef = useRef(null);
  const varButtonRef = useRef(null);

  // Fetch variables when component mounts
  useEffect(() => {
    const fetchVars = async () => {
      try {
        // Assuming getTemplateVars is imported and available
        const vars = await getTemplateVars();
        console.log(vars);
        
        setVariables(vars);
      } catch (error) {
        console.error("Error fetching template variables:", error);
        setVariables([]);
      }
    };

    fetchVars();
  }, []);

  // Keep track of cursor position in textarea
  const handleTextareaChange = (e) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
    onChange(e.target.value);
  };

  const handleTextareaClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handleTextareaKeyUp = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  // Insert variable at cursor position
  const insertVariable = (variable) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const newContent = `${beforeCursor}[${variable}]${afterCursor}`;
    setContent(newContent);
    onChange(newContent);
    setShowVarDropdown(false);
    
    // Focus back on textarea and set cursor position after the inserted variable
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = cursorPosition + variable.length + 2; // +2 for the brackets []
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
  };

  // Match the variables in text to highlight them
  const getHighlightedText = () => {
    if (!content) return '';
    
    // Regular expression to find all [VARIABLE_NAME] patterns
    const regex = /\[([A-Z_]+)\]/g;
    let result = content;
    
    // Replace each match with a highlighted span
    result = result.replace(regex, '<span class="template-variable">[$1]</span>');
    
    return result;
  };

  return (
    <div className="smart-template-editor">      
      <div className="editor-container">
        <Form.Control
          as="textarea"
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onClick={handleTextareaClick}
          onKeyUp={handleTextareaKeyUp}
          className="template-textarea"
          rows={6}
          disabled={readOnly}
        />
        
        {/* Optional styled preview (can be toggled with a button) */}
        {(content && !readOnly) && (
          <div 
            className="template-preview"
            dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
          />
        )}
      </div>
      
      {!readOnly && (
        <div className="template-variables-toolbar">
          <Button 
            variant="outline-primary"
            ref={varButtonRef}
            onClick={() => setShowVarDropdown(!showVarDropdown)}
            className="insert-variable-btn"
          >
            הוסף משתנה
          </Button>
          
          <Dropdown show={showVarDropdown} onToggle={setShowVarDropdown} className="variables-dropdown">
            <Dropdown.Menu align="end" className="variables-dropdown-menu">
              {variables.length > 0 ? (
                variables.map((v) => (
                    <Dropdown.Item 
                      key={v.id} 
                      onClick={() => insertVariable(v.name)}
                      className="variable-item"
                    >
                      <div className="variable-name">[{v.name}]</div>
                      <div className="variable-description">{v.description}</div>
                    </Dropdown.Item>
                  ))
                  
              ) : (
                <Dropdown.Item disabled>אין משתנים זמינים</Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
          
          <div className="variables-helper-text">
            לחץ על "הוסף משתנה" כדי להוסיף משתנים דינמיים לתבנית שלך
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTemplateEditor;
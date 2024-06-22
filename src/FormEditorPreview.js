import React, { useState, useEffect, useRef } from 'react';
import { FormBuilder, Form } from '@formio/react';
import 'formiojs/dist/formio.full.min.css';

const SelectPropertyEditor = ({ component, onSave, onCancel }) => {
  const [values, setValues] = useState(component.data?.values || []);
  const [label, setLabel] = useState(component.label || '');
  const [key, setKey] = useState(component.key || '');
  const [multiple, setMultiple] = useState(component.multiple || false);

  const handleSave = () => {
    const updatedComponent = {
      ...component,
      label,
      key,
      multiple,
      data: { values },
      dataSrc: 'values',
      valueProperty: 'value',
      dataType: 'auto'
    };
    onSave(updatedComponent);
  };

  const addValue = () => {
    setValues([...values, { label: '', value: '' }]);
  };

  const updateValue = (index, field, value) => {
    const newValues = [...values];
    newValues[index][field] = value;
    setValues(newValues);
  };

  const removeValue = (index) => {
    setValues(values.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>Edit Select Component</h3>
      <div>
        <label>Label: </label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div>
        <label>API Key: </label>
        <input value={key} onChange={(e) => setKey(e.target.value)} />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={multiple}
            onChange={(e) => setMultiple(e.target.checked)}
          />
          Allow Multiple Selections
        </label>
      </div>
      <h4>Values</h4>
      {values.map((value, index) => (
        <div key={index}>
          <input
            value={value.label}
            onChange={(e) => updateValue(index, 'label', e.target.value)}
            placeholder="Label"
          />
          <input
            value={value.value}
            onChange={(e) => updateValue(index, 'value', e.target.value)}
            placeholder="Value"
          />
          <button onClick={() => removeValue(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addValue}>Add Value</button>
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

const FormEditorPreview = () => {
  // ... (previous state and other functions remain the same)

  const onComponentClick = (component) => {
    console.log('Component clicked:', component);
    setSelectedComponent(component);
    setShowPropertyPopup(true);
    setPopupPosition({ x: 100, y: 100 });
  };

  const onPropertyPopupClose = (updatedComponent) => {
    console.log('Property popup closing with updated component:', updatedComponent);
    if (updatedComponent) {
      setFormSchema(prevSchema => ({
        ...prevSchema,
        components: prevSchema.components.map(comp => 
          comp.key === updatedComponent.key ? updatedComponent : comp
        )
      }));
    }
    setShowPropertyPopup(false);
    setSelectedComponent(null);
  };

  // ... (rest of the component remains the same)

  return (
    <div className="form-editor-container">
      {/* ... (other JSX remains the same) */}

      {showPropertyPopup && selectedComponent && (
        <div 
          className="property-popup" 
          style={{ left: popupPosition.x, top: popupPosition.y }}
          ref={popupRef}
        >
          {selectedComponent.type === 'select' ? (
            <SelectPropertyEditor
              component={selectedComponent}
              onSave={onPropertyPopupClose}
              onCancel={() => onPropertyPopupClose(null)}
            />
          ) : (
            <Form
              form={{
                components: getPropertyEditorFields(selectedComponent)
              }}
              submission={{data: selectedComponent}}
              onChange={(submission) => console.log('Property editor form changed:', submission)}
              onSubmit={(submission) => {
                console.log('Property editor form submitted:', submission);
                let updatedComponent = { ...selectedComponent, ...submission.data };
                if (updatedComponent.type === 'selectboxes' || updatedComponent.type === 'radio') {
                  updatedComponent.values = submission.data.values;
                }
                console.log('Updated component:', updatedComponent);
                onPropertyPopupClose(updatedComponent);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FormEditorPreview;
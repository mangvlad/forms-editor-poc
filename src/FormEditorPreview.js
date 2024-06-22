import React, { useState, useEffect, useRef } from 'react';
import { FormBuilder, Form } from '@formio/react';
import 'formiojs/dist/formio.full.min.css';

const FormEditorPreview = () => {
  const [formSchema, setFormSchema] = useState({
    components: [
      {
        type: 'button',
        label: 'Submit',
        key: 'submit',
        disableOnInvalid: true,
        input: true,
        tableView: false
      }
    ]
  });
  const [activeTab, setActiveTab] = useState('editor');
  const [isComponentPickerOpen, setIsComponentPickerOpen] = useState(true);
  const [showPropertyPopup, setShowPropertyPopup] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);

  const onFormChange = (schema) => {
    setFormSchema(schema);
  };

  useEffect(() => {
    if (activeTab === 'preview') {
      // Refresh preview when switching to the preview tab
    }
  }, [activeTab]);

  const components = {
    basic: {
      title: 'Basic',
      components: {
        textfield: 'Text Field',
        textarea: 'Text Area',
        number: 'Number',
        password: 'Password',
        checkbox: 'Checkbox',
        selectboxes: 'Select Boxes',
        select: 'Select',
        radio: 'Radio',
        button: 'Button'
      }
    },
    layout: {
      title: 'Layout',
      components: {
        columns: 'Columns',
        fieldset: 'Fieldset',
        panel: 'Panel',
        table: 'Table',
        tabs: 'Tabs',
        well: 'Well'
      }
    }
  };

  const onDragStart = (event, componentType) => {
    event.dataTransfer.setData('componentType', componentType);
  };

  const onDrop = (event) => {
    event.preventDefault();
    const componentType = event.dataTransfer.getData('componentType');
    if (componentType) {
      const newComponent = {
        type: componentType,
        label: components.basic.components[componentType] || components.layout.components[componentType],
        key: `${componentType}${Date.now()}`
      };
      setFormSchema(prevSchema => ({
        ...prevSchema,
        components: [...prevSchema.components.filter(c => c.type !== 'button'), newComponent, ...prevSchema.components.filter(c => c.type === 'button')]
      }));
      setSelectedComponent(newComponent);
      setShowPropertyPopup(true);
      setPopupPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const onPropertyPopupClose = (updatedComponent) => {
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

  const onComponentClick = (component) => {
    setSelectedComponent(component);
    setShowPropertyPopup(true);
    setPopupPosition({ x: 100, y: 100 }); // Default position when editing
  };

  const startDraggingPopup = (e) => {
    const startX = e.clientX - popupPosition.x;
    const startY = e.clientY - popupPosition.y;

    const onMouseMove = (moveEvent) => {
      setPopupPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Custom builder options
  const builderOptions = {
    builder: {
      basic: false,
      advanced: false,
      data: false,
      premium: false,
      layout: false,
      custom: false
    },
    editForm: {
      textfield: [
        {
          key: 'display',
          components: [
            { key: 'label', ignore: false },
            { key: 'placeholder', ignore: false },
            { key: 'description', ignore: false },
            { key: 'tooltip', ignore: false },
            { key: 'prefix', ignore: false },
            { key: 'suffix', ignore: false }
          ]
        },
        { key: 'data', ignore: false },
        { key: 'validation', ignore: false },
        { key: 'api', ignore: true },
        { key: 'conditional', ignore: true },
        { key: 'logic', ignore: true }
      ]
    },
    noDefaultSubmitButton: true,
    allowEditing: true
  };

  return (
    <div className="form-editor-container">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Form Editor
        </button>
        <button 
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Form Preview
        </button>
      </div>
      
      {activeTab === 'editor' && (
        <div className="editor-layout">
          <div className="form-builder" onDrop={onDrop} onDragOver={onDragOver}>
            <FormBuilder
              form={formSchema}
              onChange={onFormChange}
              options={builderOptions}
              onEditComponent={onComponentClick}
            />
          </div>
          <div className={`component-picker ${isComponentPickerOpen ? 'open' : 'closed'}`}>
            <button onClick={() => setIsComponentPickerOpen(!isComponentPickerOpen)}>
              {isComponentPickerOpen ? '▶' : '◀'}
            </button>
            {isComponentPickerOpen && (
              <div className="component-list">
                {Object.entries(components).map(([category, categoryData]) => (
                  <div key={category}>
                    <h3>{categoryData.title}</h3>
                    {Object.entries(categoryData.components).map(([type, label]) => (
                      <div 
                        key={type} 
                        draggable 
                        onDragStart={(e) => onDragStart(e, type)}
                        className="draggable-component"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'preview' && (
        <div className="preview-container">
          <Form
            form={formSchema}
          />
        </div>
      )}

      {showPropertyPopup && selectedComponent && (
        <div 
          className="property-popup" 
          style={{ left: popupPosition.x, top: popupPosition.y }}
          ref={popupRef}
        >
          <div className="property-popup-header" onMouseDown={startDraggingPopup}>
            <h3>Properties for {selectedComponent.label}</h3>
          </div>
          <Form
            form={{
              components: [
                {
                  type: 'textfield',
                  key: 'label',
                  label: 'Label',
                  defaultValue: selectedComponent.label
                },
                {
                  type: 'textfield',
                  key: 'key',
                  label: 'Key',
                  defaultValue: selectedComponent.key
                },
                {
                  type: 'checkbox',
                  key: 'required',
                  label: 'Required',
                  defaultValue: selectedComponent.required
                },
                {
                  type: 'textfield',
                  key: 'placeholder',
                  label: 'Placeholder',
                  defaultValue: selectedComponent.placeholder
                },
                {
                  type: 'textarea',
                  key: 'description',
                  label: 'Description',
                  defaultValue: selectedComponent.description
                },
                {
                  type: 'button',
                  action: 'submit',
                  label: 'Save',
                  theme: 'primary'
                }
              ]
            }}
            onSubmit={(submission) => onPropertyPopupClose({...selectedComponent, ...submission.data})}
          />
          <button onClick={() => onPropertyPopupClose(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default FormEditorPreview;
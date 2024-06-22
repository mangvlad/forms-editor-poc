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
    console.log('Form schema changed:', schema);
    setFormSchema(schema);
  };

  useEffect(() => {
    if (activeTab === 'preview') {
      console.log('Switching to preview tab');
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
      console.log('Dropping component of type:', componentType);
      const newComponent = {
        type: componentType,
        label: components.basic.components[componentType] || components.layout.components[componentType],
        key: `${componentType}${Date.now()}`
      };
      if (componentType === 'select') {
        newComponent.data = { values: [] };
        newComponent.dataSrc = 'values';
        newComponent.valueProperty = 'value';
        newComponent.dataType = 'auto';
      }
      console.log('New component:', newComponent);
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

  const onComponentClick = (component) => {
    console.log('Component clicked:', component);
    const componentCopy = JSON.parse(JSON.stringify(component));
    
    if (componentCopy.type === 'select') {
      componentCopy.data = componentCopy.data || {};
      componentCopy.data.values = componentCopy.data.values || [];
    }
    
    setSelectedComponent(componentCopy);
    setShowPropertyPopup(true);
    setPopupPosition({ x: 100, y: 100 });
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

  const getPropertyEditorFields = (component) => {
    console.log('Getting property editor fields for:', component);
    const commonFields = [
      {
        type: 'textfield',
        key: 'label',
        label: 'Label',
        required: true,
        defaultValue: component.label
      },
      {
        type: 'textfield',
        key: 'key',
        label: 'API Key',
        required: true,
        defaultValue: component.key
      },
      {
        type: 'checkbox',
        key: 'required',
        label: 'Required',
        defaultValue: component.required
      }
    ];

    const typeSpecificFields = {
      textfield: [
        {
          type: 'textfield',
          key: 'placeholder',
          label: 'Placeholder',
          defaultValue: component.placeholder
        },
        {
          type: 'number',
          key: 'maxLength',
          label: 'Maximum Length',
          defaultValue: component.maxLength
        }
      ],
      textarea: [
        {
          type: 'textfield',
          key: 'placeholder',
          label: 'Placeholder',
          defaultValue: component.placeholder
        },
        {
          type: 'number',
          key: 'rows',
          label: 'Rows',
          defaultValue: component.rows || 3
        }
      ],
      number: [
        {
          type: 'number',
          key: 'min',
          label: 'Minimum Value',
          defaultValue: component.min
        },
        {
          type: 'number',
          key: 'max',
          label: 'Maximum Value',
          defaultValue: component.max
        }
      ],
      checkbox: [
        {
          type: 'textfield',
          key: 'name',
          label: 'Name',
          required: true,
          defaultValue: component.name
        }
      ],
      select: [
        {
          type: 'datagrid',
          key: 'data.values',
          label: 'Values',
          reorder: true,
          addAnotherPosition: 'bottom',
          defaultValue: component.data?.values || [],
          components: [
            {
              type: 'textfield',
              key: 'label',
              label: 'Label',
              validate: {
                required: true
              }
            },
            {
              type: 'textfield',
              key: 'value',
              label: 'Value',
              validate: {
                required: true
              }
            }
          ]
        },
        {
          type: 'checkbox',
          key: 'multiple',
          label: 'Allow Multiple Selections',
          defaultValue: component.multiple || false
        }
      ],
      selectboxes: [
        {
          type: 'datagrid',
          key: 'values',
          label: 'Values',
          reorder: true,
          addAnotherPosition: 'bottom',
          defaultValue: component.values || [],
          components: [
            {
              type: 'textfield',
              key: 'label',
              label: 'Label',
              validate: {
                required: true
              }
            },
            {
              type: 'textfield',
              key: 'value',
              label: 'Value',
              validate: {
                required: true
              }
            }
          ]
        }
      ],
      radio: [
        {
          type: 'datagrid',
          key: 'values',
          label: 'Values',
          reorder: true,
          addAnotherPosition: 'bottom',
          defaultValue: component.values || [],
          components: [
            {
              type: 'textfield',
              key: 'label',
              label: 'Label',
              validate: {
                required: true
              }
            },
            {
              type: 'textfield',
              key: 'value',
              label: 'Value',
              validate: {
                required: true
              }
            }
          ]
        }
      ],
      button: [
        {
          type: 'select',
          key: 'action',
          label: 'Action',
          data: {
            values: [
              { label: 'Submit', value: 'submit' },
              { label: 'Reset', value: 'reset' },
              { label: 'Event', value: 'event' }
            ]
          },
          defaultValue: component.action
        }
      ]
    };

    return [
      ...commonFields,
      ...(typeSpecificFields[component.type] || []),
      {
        type: 'button',
        action: 'submit',
        label: 'Save',
        theme: 'primary'
      }
    ];
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
              components: getPropertyEditorFields(selectedComponent)
            }}
            submission={{data: selectedComponent}}
            onChange={(submission) => console.log('Property editor form changed:', submission)}
            onSubmit={(submission) => {
              console.log('Property editor form submitted:', submission);
              let updatedComponent = { ...selectedComponent, ...submission.data };
              if (updatedComponent.type === 'select') {
                updatedComponent.data = updatedComponent.data || {};
                updatedComponent.data.values = submission.data['data.values'] || [];
                updatedComponent.dataSrc = 'values';
                updatedComponent.valueProperty = 'value';
                updatedComponent.dataType = 'auto';
              } else if (updatedComponent.type === 'selectboxes' || updatedComponent.type === 'radio') {
                updatedComponent.values = submission.data.values;
              }
              console.log('Updated component:', updatedComponent);
              onPropertyPopupClose(updatedComponent);
            }}
          />
          <button onClick={() => onPropertyPopupClose(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default FormEditorPreview;
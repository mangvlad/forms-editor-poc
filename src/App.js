import React, { useState } from 'react';
import './App.css';

function App() {
  const [formFields, setFormFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');

  const addField = () => {
    if (newFieldName.trim() !== '') {
      setFormFields([...formFields, { name: newFieldName, type: 'text' }]);
      setNewFieldName('');
    }
  };

  return (
    <div className="App">
      <h1>Forms Editor POC</h1>
      <div>
        <input
          type="text"
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          placeholder="Enter field name"
        />
        <button onClick={addField}>Add Field</button>
      </div>
      <div>
        <h2>Form Preview</h2>
        {formFields.map((field, index) => (
          <div key={index}>
            <label>{field.name}: </label>
            <input type={field.type} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

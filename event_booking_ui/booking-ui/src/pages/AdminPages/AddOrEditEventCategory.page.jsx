import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventCategoryForm = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([
  {
    "id": 1,
    "name": "Technology Conference"
  },
  {
    "id": 2,
    "name": "Health & Wellness Workshop"
  },
  {
    "id": 3,
    "name": "Art & Creativity Session"
  },
  {
    "id": 4,
    "name": "Business & Networking"
  },
  {
    "id": 5,
    "name": "Educational Webinar"
  },
  {
    "id": 6,
    "name": "Technology Conference"
  },
  {
    "id": 25,
    "name": "Health & Wellness Workshop"
  },
  {
    "id": 36,
    "name": "Art & Creativity Session"
  },
  {
    "id": 445,
    "name": "Business & Networking"
  },
  {
    "id": 355,
    "name": "Educational Webinar"
  }
]);
  const [editId, setEditId] = useState(null);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/categories/${editId}/`, { name });
        alert('Category updated');
      } else {
        await axios.post('/api/categories/', { name });
        alert('Category saved');
      }
      setName('');
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditId(cat.id);
  };

  const handleAddNew = () => {
    setName('');
    setEditId(null);
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="card p-4 shadow" style={{ width: '400px', height:"fit-content" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{editId ? 'Edit' : 'Add'} Event Category</h4>
          {editId && (
            <button className="btn btn-sm btn-outline-primary" onClick={handleAddNew}>Add New</button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group mt-3">
            <label>Category Name</label>
            <input type="text" className="form-control" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>
          <button className="btn btn-primary mt-3 w-100">{editId ? 'Update' : 'Save'}</button>
        </form>
      </div>

      <div className="card p-4 shadow ms-4" style={{ width: '400px' }}>
        <h5>Existing Categories</h5>
        <ul className="list-group">
          {categories?.map(cat => (
            <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
              {cat.name}
              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(cat)}>Edit</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventCategoryForm;

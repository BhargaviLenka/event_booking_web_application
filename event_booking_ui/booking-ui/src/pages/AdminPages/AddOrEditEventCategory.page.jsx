import React, { useState, useEffect } from 'react';
import useAxios from '../../useAxios';

const EventCategoryForm = () => {
  const [categoryResponse, categoryError, categoryLoading, categoryFetchData] = useAxios();  
  const [submitResponse, submitError, submitLoading, submitFetchData] = useAxios();

  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [submitResponse]);

  const fetchCategories = async () => {
    try {
      categoryFetchData({ method: 'GET', url: 'api/categories/' });
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (categoryResponse?.result === 'Success') {
      setCategories(categoryResponse.data);
    }
  }, [categoryResponse]);

  useEffect(() => {
    if (submitResponse?.result === 'Success') {
      alert(editId ? 'Category updated' : 'Category saved');
      setName('');
      setEditId(null);
      fetchCategories();
    }
    else if (submitResponse?.result === 'Failed') {
        const errMsg = submitError.response?.data?.message || 'Failed to save category';
      alert(errMsg);
    }
  }, [submitResponse]);

  useEffect(() => {
    if (submitError) {
      console.error('Save failed:', submitError);
      const errMsg = submitError.response?.data?.message || 'Failed to save category';
      alert(errMsg);
    }
  }, [submitError]);

  useEffect(() => {
    if (categoryError) {
      console.error('Fetch categories failed:', categoryError);
      const errMsg = categoryError.response?.data?.message || 'Failed to fetch categories';
      alert(errMsg);
    }
  }, [categoryError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = {
      method: editId ? 'PUT' : 'POST',
      url: editId ? `/api/categories/${editId}/` : '/api/categories/',
      data: { name }
    };
    submitFetchData(config);
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
      <div className="card p-4 shadow" style={{ width: '400px', height: "fit-content" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{editId ? 'Edit' : 'Add'} Event Category</h4>
          {editId && (
            <button className="btn btn-sm btn-outline-primary" onClick={handleAddNew}>Add New</button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group mt-3">
            <label>Category Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary mt-3 w-100" disabled={submitLoading}>
            {submitLoading ? 'Saving...' : editId ? 'Update' : 'Save'}
          </button>
        </form>
        {submitError && (
          <p className="text-danger mt-2">
            Error: {submitError.response?.data?.message || submitError.message}
          </p>
        )}
      </div>

      <div className="card p-4 shadow ms-4" style={{ width: '400px' }}>
        <h5>Existing Categories</h5>
        {categoryLoading ? (
          <div className="text-center py-3">Loading categories...</div>
        ) : (
          <ul className="list-group">
            {categories?.map(cat => (
              <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                {cat.name}
                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(cat)}>Edit</button>
              </li>
            ))}
          </ul>
        )}
        {categoryError && (
          <p className="text-danger mt-2">
            Error: {categoryError.response?.data?.message || categoryError.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCategoryForm;

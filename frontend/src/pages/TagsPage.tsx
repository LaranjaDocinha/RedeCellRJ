import React, { useState, useEffect } from 'react';
import { TagList } from '../components/TagList';
import { TagForm } from '../components/TagForm';

interface Tag {
  id: number;
  name: string;
}

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags'); // Assuming proxy is set up for /tags to backend
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleCreateTag = async (tagData: Omit<Tag, 'id'>) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setShowForm(false);
      fetchTags();
    } catch (error) {
      console.error("Error creating tag:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleUpdateTag = async (id: number, tagData: Omit<Tag, 'id'>) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setEditingTag(undefined);
      setShowForm(false);
      fetchTags();
    } catch (error) {
      console.error("Error updating tag:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleEditClick = (id: number) => {
    const tagToEdit = tags.find((t) => t.id === id);
    if (tagToEdit) {
      setEditingTag(tagToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingTag(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tag Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Tag
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingTag ? 'Edit Tag' : 'Add New Tag'}
          </h2>
          <TagForm
            initialData={editingTag}
            onSubmit={(data) => {
              if (editingTag) {
                handleUpdateTag(editingTag.id, data);
              } else {
                handleCreateTag(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <TagList
        tags={tags}
        onEdit={handleEditClick}
        onDelete={handleDeleteTag}
      />
    </div>
  );
};

export default TagsPage;
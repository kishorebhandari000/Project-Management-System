import Sidebar from '../../components/Sidebar';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    supervisor: '',
    category: 'Machine Learning',
    description: '',
    maxStudents: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/admin/projects');
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Create Project</h1>
              <p className="text-gray-600">Add a new project to the system</p>
            </div>
            <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
              AD
            </Link>
          </div>
        </div>

        <div className="p-8 max-w-2xl">
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-2">Project Title</label>
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Enter project title..."
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Supervisor</label>
                <select
                  name="supervisor"
                  value={form.supervisor}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                >
                  <option value="">Select a supervisor</option>
                  <option>Dr. Sarah Johnson</option>
                  <option>Dr. Emily Chen</option>
                  <option>Prof. Michael Brown</option>
                  <option>Dr. Robert Lee</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                >
                  <option>Machine Learning</option>
                  <option>Web Development</option>
                  <option>Mobile Apps</option>
                  <option>IoT</option>
                  <option>Blockchain</option>
                  <option>Data Science</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Describe the project..."
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]">
                  Create Project
                </button>
                <Link to="/admin/projects" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

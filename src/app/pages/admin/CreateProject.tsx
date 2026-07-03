import Sidebar from '../../components/Sidebar';
import { useNavigate, Link } from 'react-router';
import type { FormEvent } from 'react';

export default function CreateProject() {
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
              <h1 className="text-2xl">Create New Project</h1>
              <p className="text-gray-600">Add a new project to the system</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/admin/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                AD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl mb-4">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Project Title</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                        placeholder="Enter project title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Description</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                        placeholder="Enter detailed project description"
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Category</label>
                        <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                          <option>Machine Learning</option>
                          <option>Web Development</option>
                          <option>Mobile Development</option>
                          <option>IoT</option>
                          <option>Cybersecurity</option>
                          <option>Blockchain</option>
                          <option>Data Science</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Supervisor</label>
                        <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                          <option>Dr. Sarah Johnson</option>
                          <option>Prof. Michael Brown</option>
                          <option>Dr. Emily Chen</option>
                          <option>Dr. Robert Lee</option>
                          <option>Prof. Lisa Wang</option>
                          <option>Dr. James Wilson</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-xl mb-4">Project Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Group Size</label>
                        <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                          <option value="1">Individual (1 student)</option>
                          <option value="2">Pair (2 students)</option>
                          <option value="3">Small Group (3 students)</option>
                          <option value="4">Medium Group (4 students)</option>
                          <option value="5">Large Group (5 students)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Difficulty Level</label>
                        <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Duration (weeks)</label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                          defaultValue={12}
                          min={1}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Assign to Group (Optional)</label>
                      <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]">
                        <option value="">Not Assigned</option>
                        <option value="group1">Group 1</option>
                        <option value="group2">Group 2</option>
                        <option value="group3">Group 3</option>
                        <option value="group4">Group 4</option>
                        <option value="group5">Group 5</option>
                        <option value="group6">Group 6</option>
                        <option value="group7">Group 7</option>
                        <option value="group8">Group 8</option>
                        <option value="group9">Group 9</option>
                        <option value="group10">Group 10</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Leave as "Not Assigned" to make project available for any group to request</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Prerequisites</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-4 py-3 h-24 focus:outline-none focus:border-[#2563a8]"
                        placeholder="List any required skills or knowledge (e.g., Python, React, Database Design)"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Learning Outcomes</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-4 py-3 h-24 focus:outline-none focus:border-[#2563a8]"
                        placeholder="What will students learn from this project?"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Resources/References</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-4 py-3 h-20 focus:outline-none focus:border-[#2563a8]"
                        placeholder="Links to papers, documentation, or other resources"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/projects')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

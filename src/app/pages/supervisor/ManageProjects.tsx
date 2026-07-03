import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function ManageProjects() {
  const projects = [
    { id: 1, title: 'AI-Based Recommendation System', student: 'John Doe', status: 'Active' },
    { id: 2, title: 'E-commerce Platform', student: 'Jane Smith', status: 'Active' },
    { id: 3, title: 'Mobile Health App', student: 'Mike Johnson', status: 'Active' },
    { id: 4, title: 'Machine Learning for Medical Diagnosis', student: 'Unassigned', status: 'Available' },
    { id: 5, title: 'IoT Smart Home Automation', student: 'Unassigned', status: 'Available' },
  ];

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Projects</h1>
              <p className="text-gray-600">Create and manage your project offerings</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Create Project
              </button>
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Project Title</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">{project.title}</td>
                    <td className="px-6 py-4">
                      <span className={project.student === 'Unassigned' ? 'text-gray-500' : ''}>
                        {project.student}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${
                        project.status === 'Active' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                          Edit
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create Project Form */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
            <h2 className="text-xl mb-5">Create New Project</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Enter project description"
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
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="1"
                    defaultValue={1}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function ManageProjects() {
  const projects = [
    { id: 1, title: 'AI-Based Recommendation System', supervisor: 'Dr. Sarah Johnson', student: 'John Doe', status: 'Active', category: 'Machine Learning' },
    { id: 2, title: 'E-commerce Platform', supervisor: 'Dr. Sarah Johnson', student: 'Jane Smith', status: 'Active', category: 'Web Development' },
    { id: 3, title: 'Mobile Health App', supervisor: 'Dr. Sarah Johnson', student: 'Mike Johnson', status: 'Active', category: 'Mobile Apps' },
    { id: 4, title: 'Machine Learning for Medical Diagnosis', supervisor: 'Dr. Emily Chen', student: 'Unassigned', status: 'Available', category: 'Machine Learning' },
    { id: 5, title: 'Blockchain-Based Voting System', supervisor: 'Prof. Michael Brown', student: 'Unassigned', status: 'Available', category: 'Blockchain' },
    { id: 6, title: 'IoT Smart Home Automation', supervisor: 'Dr. Sarah Johnson', student: 'Unassigned', status: 'Available', category: 'IoT' },
    { id: 7, title: 'Natural Language Processing Chatbot', supervisor: 'Dr. Robert Lee', student: 'Unassigned', status: 'Available', category: 'Machine Learning' },
  ];

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Projects</h1>
              <p className="text-gray-600">Oversee all projects in the system</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/projects/create" className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Create Project
              </Link>
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
          {/* Filter Section */}
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Search projects..."
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Available</option>
                  <option>Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]">
                  <option>All Categories</option>
                  <option>Machine Learning</option>
                  <option>Web Development</option>
                  <option>Mobile Apps</option>
                  <option>IoT</option>
                  <option>Blockchain</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Supervisor</label>
                <select className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#2563a8]">
                  <option>All Supervisors</option>
                  <option>Dr. Sarah Johnson</option>
                  <option>Dr. Emily Chen</option>
                  <option>Prof. Michael Brown</option>
                  <option>Dr. Robert Lee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Project Title</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Supervisor</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Student</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Category</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Status</th>
                  <th className="text-left px-6 py-4 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">{project.title}</td>
                    <td className="px-6 py-4">{project.supervisor}</td>
                    <td className="px-6 py-4">
                      <span className={project.student === 'Unassigned' ? 'text-gray-500' : ''}>
                        {project.student}
                      </span>
                    </td>
                    <td className="px-6 py-4">{project.category}</td>
                    <td className="px-6 py-4">
                      <span className={`${
                        project.status === 'Active' ? 'text-green-600' :
                        project.status === 'Available' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                          View
                        </button>
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

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Projects</div>
              <div className="text-3xl text-[#2563a8]">{projects.length}</div>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Active Projects</div>
              <div className="text-3xl text-green-600">
                {projects.filter(p => p.status === 'Active').length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Available Projects</div>
              <div className="text-3xl text-blue-600">
                {projects.filter(p => p.status === 'Available').length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Unassigned</div>
              <div className="text-3xl text-orange-600">
                {projects.filter(p => p.student === 'Unassigned').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

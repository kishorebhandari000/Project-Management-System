import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

const projects = [
  { id: 1, title: 'AI-Based Recommendation System', student: 'John Doe', status: 'Active', progress: 65 },
  { id: 2, title: 'E-commerce Platform', student: 'Jane Smith', status: 'Active', progress: 45 },
  { id: 3, title: 'Mobile Health App', student: 'Mike Johnson', status: 'Active', progress: 80 },
  { id: 4, title: 'IoT Smart Home Automation', student: 'Unassigned', status: 'Available', progress: 0 },
];

export default function ManageProjects() {
  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Manage Projects</h1>
              <p className="text-gray-600">Oversee your supervised projects</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Projects</div>
              <div className="text-3xl">{projects.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Active</div>
              <div className="text-3xl text-green-600">{projects.filter(p => p.status === 'Active').length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Available</div>
              <div className="text-3xl text-blue-600">{projects.filter(p => p.status === 'Available').length}</div>
            </div>
          </div>

          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg">{p.title}</h3>
                    <p className="text-gray-500 text-sm">
                      Student: <span className={p.student === 'Unassigned' ? 'text-gray-400 italic' : 'text-gray-700'}>{p.student}</span>
                    </p>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.status}
                  </span>
                </div>
                {p.status === 'Active' && (
                  <div>
                    <div className="bg-gray-200 h-2 rounded-full mb-1">
                      <div className="bg-[#2563a8] h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500">{p.progress}% Complete</div>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">View Details</button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

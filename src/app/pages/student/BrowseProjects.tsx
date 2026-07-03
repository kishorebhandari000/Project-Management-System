import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function BrowseProjects() {
  const projects = [
    {
      id: 1,
      title: 'Machine Learning for Medical Diagnosis',
      supervisor: 'Dr. Emily Chen',
      description: 'Develop a machine learning model to assist in diagnosing medical conditions from patient data and imaging.',
      status: 'Available'
    },
    {
      id: 2,
      title: 'Blockchain-Based Voting System',
      supervisor: 'Prof. Michael Brown',
      description: 'Design and implement a secure voting system using blockchain technology to ensure transparency.',
      status: 'Available'
    },
    {
      id: 3,
      title: 'IoT Smart Home Automation',
      supervisor: 'Dr. Sarah Johnson',
      description: 'Create an IoT-based system for automating home appliances with mobile app integration.',
      status: 'Taken'
    },
    {
      id: 4,
      title: 'Natural Language Processing Chatbot',
      supervisor: 'Dr. Robert Lee',
      description: 'Build an intelligent chatbot using NLP techniques for customer service applications.',
      status: 'Available'
    },
    {
      id: 5,
      title: 'Augmented Reality Education App',
      supervisor: 'Prof. Lisa Wang',
      description: 'Develop an AR application for interactive learning experiences in science education.',
      status: 'Available'
    },
    {
      id: 6,
      title: 'Cybersecurity Threat Detection',
      supervisor: 'Dr. James Wilson',
      description: 'Implement an AI-based system for detecting and preventing cybersecurity threats in networks.',
      status: 'Taken'
    }
  ];

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Browse Projects</h1>
              <p className="text-gray-600">Explore available final year projects</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                JD
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
            />
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg pr-4">{project.title}</h3>
                  <span className={`text-sm px-3 py-1 rounded ${
                    project.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <span>Supervisor: </span>
                  <span>{project.supervisor}</span>
                </div>
                <p className="text-gray-700 mb-4">{project.description}</p>
                <button
                  className={`px-5 py-2 rounded-md ${
                    project.status === 'Available'
                      ? 'bg-[#2563a8] text-white hover:bg-[#1e4a8a]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={project.status === 'Taken'}
                >
                  {project.status === 'Available' ? 'Request' : 'Not Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';

export default function Reports() {
  const submissionStats = [
    { assessment: 'Project Proposal', submissions: 45, total: 60, percentage: 75 },
    { assessment: 'Literature Review', submissions: 32, total: 60, percentage: 53 },
    { assessment: 'Requirements Doc', submissions: 58, total: 60, percentage: 97 },
    { assessment: 'Design Spec', submissions: 50, total: 60, percentage: 83 },
  ];

  const projectCategories = [
    { category: 'Machine Learning', count: 28 },
    { category: 'Web Development', count: 22 },
    { category: 'Mobile Apps', count: 18 },
    { category: 'IoT', count: 15 },
    { category: 'Cybersecurity', count: 12 },
    { category: 'Other', count: 3 },
  ];

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Reports</h1>
              <p className="text-gray-600">System statistics and analytics</p>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-2">Total Projects</div>
              <div className="text-4xl text-[#2563a8]">98</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-2">Completion Rate</div>
              <div className="text-4xl text-green-600">87%</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-2">Avg Grade</div>
              <div className="text-4xl text-[#2563a8]">74.5</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-2">Pending Reviews</div>
              <div className="text-4xl text-orange-600">23</div>
            </div>
          </div>

          {/* Submission Statistics */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
            <h2 className="text-xl mb-6">Submission Statistics</h2>
            <div className="space-y-5">
              {submissionStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span>{stat.assessment}</span>
                    <span className="text-gray-600">
                      {stat.submissions}/{stat.total} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="bg-gray-200 h-4 rounded-full">
                    <div
                      className="bg-[#2563a8] h-4 rounded-full"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Breakdown */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl mb-6">Project Breakdown by Category</h2>
            <div className="space-y-3">
              {projectCategories.map((category, index) => (
                <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0">
                  <span>{category.category}</span>
                  <span className="text-lg">{category.count} projects</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
            <h2 className="text-xl mb-5">Export Reports</h2>
            <div className="flex gap-3">
              <button className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]">
                Export as PDF
              </button>
              <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300">
                Export as CSV
              </button>
              <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300">
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

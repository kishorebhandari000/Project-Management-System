import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';

interface Assessment {
  _id: string;
  title: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  mark: number | null;
  submittedAt?: string;
  student: { name: string; email: string };
  project: { name: string };
}

export default function SupervisorAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/assessments/supervisor')
      .then((d) => setAssessments(d.assessments))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const pending = assessments.filter((a) => a.status === 'submitted');
  const graded = assessments.filter((a) => a.status === 'graded');

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Review and grade student submissions</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full" />
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total</div>
              <div className="text-3xl">{assessments.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Review</div>
              <div className="text-3xl text-orange-600">{pending.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Graded</div>
              <div className="text-3xl text-green-600">{graded.length}</div>
            </div>
          </div>

          {loading && <div className="text-center py-20 text-gray-500">Loading...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {!loading && !error && assessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No assessments assigned to you yet.
            </div>
          )}

          {assessments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Student</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Assessment</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Project</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Submitted</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Mark</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a._id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">{a.student?.name}</td>
                      <td className="px-6 py-4">{a.title}</td>
                      <td className="px-6 py-4 text-gray-500">{a.project?.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={
                          a.status === 'graded' ? 'text-green-600' :
                          a.status === 'submitted' ? 'text-orange-600' : 'text-gray-400'
                        }>
                          {a.status === 'not_submitted' ? 'Not submitted' :
                           a.status === 'submitted' ? 'Pending review' : 'Graded'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {a.mark !== null ? <span className="text-green-600">{a.mark}/100</span> : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/supervisor/assessments/grade/${a._id}`}
                          className={`px-4 py-2 rounded-md text-sm ${
                            a.status === 'submitted'
                              ? 'bg-[#2563a8] text-white hover:bg-[#1e4a8a]'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {a.status === 'submitted' ? 'Grade' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

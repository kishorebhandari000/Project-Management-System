import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';

interface Assessment {
  _id: string;
  title: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  mark: number | null;
  feedback: string;
  submittedAt?: string;
  supervisor: { name: string };
  project: { name: string };
}

export default function Feedback() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/assessments/my')
      .then((d) => setAssessments(d.assessments))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const graded = assessments.filter((a) => a.status === 'graded');
  const pending = assessments.filter((a) => a.status === 'submitted');
  const avgMark = graded.length
    ? Math.round(graded.reduce((sum, a) => sum + (a.mark ?? 0), 0) / graded.length)
    : null;

  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Feedback & Marks</h1>
              <p className="text-gray-600">View your assessment results and supervisor feedback</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full" />
              </Link>
              <Link to="/student/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a]">
                {localStorage.getItem('userName')?.[0] ?? 'S'}
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Graded</div>
              <div className="text-3xl text-green-600">{graded.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Awaiting Grade</div>
              <div className="text-3xl text-orange-500">{pending.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Average Mark</div>
              <div className="text-3xl text-[#2563a8]">{avgMark !== null ? `${avgMark}%` : '—'}</div>
            </div>
          </div>

          {loading && <div className="text-center py-16 text-gray-500">Loading feedback...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {/* Graded assessments */}
          {graded.map((a) => (
            <div key={a._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl">{a.title}</h2>
                  <p className="text-sm text-gray-500">{a.project?.name} &bull; Supervisor: {a.supervisor?.name}</p>
                </div>
                <span className="text-3xl text-green-600 font-semibold">{a.mark}/100</span>
              </div>
              <div className="bg-gray-200 h-3 rounded-full mb-4">
                <div className="bg-[#2563a8] h-3 rounded-full" style={{ width: `${a.mark}%` }} />
              </div>
              {a.feedback ? (
                <div>
                  <div className="text-gray-600 mb-2 text-sm">Supervisor Feedback</div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700">{a.feedback}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">No written feedback provided.</p>
              )}
            </div>
          ))}

          {/* Pending */}
          {pending.map((a) => (
            <div key={a._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-2">{a.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{a.project?.name} &bull; Supervisor: {a.supervisor?.name}</p>
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-gray-600 mb-1">Marks Not Yet Released</div>
                <div className="text-gray-400 text-sm">Your supervisor is currently reviewing this submission</div>
              </div>
            </div>
          ))}

          {!loading && assessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No assessments yet. Check the Assessments page to submit your work.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

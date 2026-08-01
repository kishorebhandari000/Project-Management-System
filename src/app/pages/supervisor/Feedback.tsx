import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';

interface Submission {
  _id: string;
  marks: number | null;
  feedback: string;
  gradedAt?: string;
  student: { name: string; email: string };
  assessment: { title: string };
}

export default function SupervisorFeedback() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/submissions')
      .then((d) => setSubmissions(d.submissions.filter((s: any) => s.status === 'graded')))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load feedback'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Feedback</h1>
              <p className="text-gray-600">View feedback you have given to students</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <ProfileAvatar role="supervisor" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {loading && <div className="text-center py-16 text-gray-500">Loading feedback...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {!loading && !error && submissions.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              You haven't graded any submissions yet.
            </div>
          )}

          {submissions.map((s) => (
            <div key={s._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg">{s.student?.name} — {s.assessment?.title}</h3>
                  <p className="text-sm text-gray-500">
                    Graded: {s.gradedAt ? new Date(s.gradedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <span className="text-2xl text-green-600">{s.marks}/100</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">{s.feedback || <span className="italic text-gray-400">No written feedback provided.</span>}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';

interface AssessmentFile {
  url: string;
  name: string;
}

interface Assessment {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  files: AssessmentFile[];
  visibleProjectCount: number;
}

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/assessments/all')
      .then((data) => setAssessments(data.assessments))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const released = assessments.filter((a) => a.visibleProjectCount > 0).length;

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments</h1>
              <p className="text-gray-600">Manage the shared assessment templates for this trimester</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/assessments/create" className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Create Assessment
              </Link>
              <NotificationBell role="admin" />

              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Templates</div>
              <div className="text-3xl">{assessments.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Released to at Least One Project</div>
              <div className="text-3xl text-green-600">{released}</div>
            </div>
          </div>

          {loading && <div className="text-center py-20 text-gray-500">Loading...</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}

          {!loading && !error && assessments.length === 0 && (
            <div className="bg-white rounded-lg p-16 border border-gray-200 text-center text-gray-500">
              No assessment templates in the system yet.
            </div>
          )}

          {assessments.length > 0 && (
            <div className="space-y-4">
              {assessments.map((a) => (
                <div key={a._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                    <div>
                      <h3 className="text-lg mb-1">{a.title}</h3>
                      {a.description && <p className="text-sm text-gray-600">{a.description}</p>}
                      {a.dueDate && (
                        <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                      )}
                      {a.files?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3">
                          {a.files.map((f, idx) => (
                            <a
                              key={idx}
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#2563a8] hover:underline text-sm"
                            >
                              📎 {f.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-sm shrink-0 ${a.visibleProjectCount > 0 ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {a.visibleProjectCount > 0
                        ? `Visible to ${a.visibleProjectCount} project${a.visibleProjectCount === 1 ? '' : 's'}`
                        : 'Not released yet'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

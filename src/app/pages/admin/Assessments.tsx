import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Sidebar from '../../components/Sidebar';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';

interface Assessment {
  _id: string;
  title: string;
  student: { name: string; email: string };
  supervisor: { name: string; email: string };
  project: { title: string };
}

interface Submission {
  _id: string;
  assessment: { _id: string };
  fileUrl: string;
  fileName: string;
  status: 'submitted' | 'graded';
  marks: number | null;
  feedback: string;
  submittedAt: string;
}

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get('/assessments/all'), api.get('/submissions')])
      .then(([a, s]) => {
        setAssessments(a.assessments);
        setSubmissions(s.submissions);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const submissionFor = (assessmentId: string) =>
    submissions.find((s) => s.assessment._id === assessmentId);

  const pending = submissions.filter((s) => s.status === 'submitted');
  const graded = submissions.filter((s) => s.status === 'graded');

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Assessments Overview</h1>
              <p className="text-gray-600">Monitor all assessment submissions across the system</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/assessments/create" className="bg-[#2563a8] text-white px-5 py-2 rounded-md hover:bg-[#1e4a8a]">
                Create Assessment
              </Link>
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full" />
              </Link>
              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              No assessments in the system yet.
            </div>
          )}

          {assessments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto"><table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Student</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Supervisor</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Assessment</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Project</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Submitted</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Mark</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">Feedback</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-600">File</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => {
                    const submission = submissionFor(a._id);
                    const status = submission?.status ?? 'not_submitted';
                    const isExpanded = expandedId === submission?._id;
                    return (
                      <React.Fragment key={a._id}>
                        <tr className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4">{a.student?.name}</td>
                          <td className="px-6 py-4 text-gray-600">{a.supervisor?.name}</td>
                          <td className="px-6 py-4">{a.title}</td>
                          <td className="px-6 py-4 text-gray-500">{a.project?.title}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={
                              status === 'graded' ? 'text-green-600' :
                              status === 'submitted' ? 'text-orange-600' : 'text-gray-400'
                            }>
                              {status === 'not_submitted' ? 'Not submitted' :
                               status === 'submitted' ? 'Pending review' : 'Graded'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {submission?.marks !== null && submission?.marks !== undefined ? (
                              <span className="text-green-600">{submission.marks}/100</span>
                            ) : '—'}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            {submission?.feedback ? (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : submission._id)}
                                className="text-[#2563a8] hover:underline text-sm text-left"
                              >
                                {isExpanded ? 'Hide feedback' : 'View feedback'}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm italic">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {submission?.fileUrl ? (
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#2563a8] hover:underline text-sm"
                              >
                                📎 {submission.fileName}
                              </a>
                            ) : '—'}
                          </td>
                        </tr>

                        {isExpanded && submission?.feedback && (
                          <tr className="border-t border-gray-200 bg-gray-50">
                            <td colSpan={9} className="px-6 py-5">
                              <div className="max-w-2xl">
                                <div className="text-gray-600 mb-2 text-sm">Supervisor Feedback</div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <p className="text-gray-700">{submission.feedback}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
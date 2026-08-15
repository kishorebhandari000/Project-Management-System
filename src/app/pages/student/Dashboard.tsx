import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import NotificationBell from '../../components/NotificationBell';
import ProfileAvatar from '../../components/ProfileAvatar';
import SectionHint from '../../components/SectionHint';
import { sectionHints } from '../../lib/sectionHints';

interface ProjectFile {
  url: string;
  name: string;
}

interface ApiAllocation {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  project: {
    _id: string;
    title: string;
    status: string;
    description?: string;
    maxStudents?: number;
    files?: ProjectFile[];
  };
  supervisor: {
    name: string;
  };
}

interface Assessment {
  _id: string;
  title: string;
  dueDate?: string;
}

interface Submission {
  _id: string;
  assessment: { _id: string };
  status: 'submitted' | 'graded';
  marks: number | null;
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState('');
  const [currentAllocation, setCurrentAllocation] = useState<ApiAllocation | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Student');

    const load = async () => {
      try {
        const data = await api.get('/allocations?status=approved');
        setCurrentAllocation(data.allocations[0] || null);
      } catch {
        setCurrentAllocation(null);
      }

      // Same fetch/combine approach as student/Assessments.tsx.
      try {
        const [assessmentsRes, submissionsRes] = await Promise.all([
          api.get('/assessments/my'),
          api.get('/submissions'),
        ]);
        setAssessments(assessmentsRes.assessments);
        setSubmissions(submissionsRes.submissions);
      } catch {
        setAssessments([]);
        setSubmissions([]);
      }

      setLoading(false);
    };
    load();
  }, []);

  const submissionFor = (assessmentId: string) => submissions.find((s) => s.assessment._id === assessmentId);

  const pendingAssessments = assessments
    .filter((a) => !submissionFor(a._id))
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aTime - bTime;
    });
  const upcomingPreview = pendingAssessments.slice(0, 5);

  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
  const avgMark = gradedSubmissions.length
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.marks ?? 0), 0) / gradedSubmissions.length)
    : null;

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="student" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userName}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="student" />
              <ProfileAvatar role="student" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Current Project</div>
              <div className="text-3xl">{currentAllocation ? 1 : 0}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Assessments</div>
              <div className="text-3xl">{pendingAssessments.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Submitted</div>
              <div className="text-3xl">{submissions.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Average Mark</div>
              <div className="text-3xl">{avgMark !== null ? `${avgMark}%` : '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Project */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5 flex items-center">
                Current Project
                <SectionHint text={sectionHints.studentCurrentProject} />
              </h2>

              {loading && <p className="text-gray-500">Loading...</p>}

              {!loading && !currentAllocation && (
                <div>
                  <p className="text-gray-500 mb-3">You don't have an approved project yet.</p>
                  <Link to="/student/projects" className="text-[#2563a8] hover:underline">
                    Browse available projects
                  </Link>
                </div>
              )}

             {!loading && currentAllocation && (
                <>
                  <div className="mb-3">
                    <div className="text-gray-600">Title</div>
                    <div className="text-lg">{currentAllocation.project.title}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-600">Supervisor</div>
                    <div>{currentAllocation.supervisor?.name}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-gray-600">Status</div>
                    <span className="text-green-600">Active</span>
                  </div>
                  {currentAllocation.project.maxStudents !== undefined && (
                    <div className="mb-3">
                      <div className="text-gray-600">Group Size</div>
                      <div>Up to {currentAllocation.project.maxStudents} member(s)</div>
                    </div>
                  )}
                  {currentAllocation.project.description && (
                    <div className="mb-3">
                      <div className="text-gray-600">Description</div>
                      <p className="text-sm">{currentAllocation.project.description}</p>
                    </div>
                  )}
                  {currentAllocation.project.files && currentAllocation.project.files.length > 0 && (
                    <div className="mb-3">
                      <div className="text-gray-600 mb-1">Files</div>
                      <ul className="space-y-1">
                        {currentAllocation.project.files.map((f, idx) => (
                          <li key={idx}>
                            <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#2563a8] hover:underline text-sm">
                              📎 {f.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-600">Progress</div>
                    <p className="text-sm text-gray-400 mt-1">
                      Progress tracking isn't built yet - needs the Assessments module.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Upcoming Deadlines</h2>

              {loading && <p className="text-gray-500">Loading...</p>}

              {!loading && upcomingPreview.length === 0 && (
                <p className="text-gray-500 text-sm">No pending assessments right now — you're all caught up.</p>
              )}

              {!loading && upcomingPreview.length > 0 && (
                <div className="space-y-3">
                  {upcomingPreview.map((a) => (
                    <div
                      key={a._id}
                      className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="text-sm">{a.title}</span>
                      <span className="text-xs text-gray-500 shrink-0 ml-4">
                        {a.dueDate ? `Due ${new Date(a.dueDate).toLocaleDateString()}` : 'No due date'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!loading && pendingAssessments.length > 5 && (
                <Link to="/student/assessments" className="inline-block mt-4 text-sm text-[#2563a8] hover:underline">
                  View all
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
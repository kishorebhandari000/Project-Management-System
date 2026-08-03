import Sidebar from '../../components/Sidebar';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface ApiProject {
  _id: string;
  title: string;
  status: string;
}

interface ApiAllocation {
  _id: string;
  project: { _id: string; title: string } | null;
  student: { _id: string; name: string } | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface ApiAssessment {
  _id: string;
  title: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  submittedAt?: string;
  student: { _id: string; name: string } | null;
  project: { title: string } | null;
}

export default function SupervisorDashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const userName = localStorage.getItem('userName') || 'Supervisor';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsRes, allocationsRes, assessmentsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/allocations'),
        api.get('/assessments/supervisor'),
      ]);
      setProjects(projectsRes.projects);
      // Skip any allocation whose linked project or student no longer exists (deleted record)
      setAllocations(allocationsRes.allocations.filter((a: ApiAllocation) => a.project && a.student));
      setAssessments(assessmentsRes.assessments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingRequests = allocations.filter((a) => a.status === 'pending');
  const approvedAllocations = allocations.filter((a) => a.status === 'approved');
  const activeStudentIds = new Set(approvedAllocations.map((a) => a.student!._id));
  const pendingReviews = assessments.filter((a) => a.status === 'submitted');

  const getStudentProgress = (studentId: string) => {
    const studentAssessments = assessments.filter((a) => a.student?._id === studentId);
    if (studentAssessments.length === 0) return 0;
    const graded = studentAssessments.filter((a) => a.status === 'graded').length;
    return Math.round((graded / studentAssessments.length) * 100);
  };

  const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
    setDecidingId(id);
    try {
      await api.put(`/allocations/${id}/decision`, { decision });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update request');
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Supervisor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userName}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="supervisor" />
              <ProfileAvatar role="supervisor" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Total Projects</div>
              <div className="text-3xl">{loading ? '—' : projects.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Active Students</div>
              <div className="text-3xl">{loading ? '—' : activeStudentIds.size}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">Pending Requests</div>
              <div className="text-3xl text-orange-600">{loading ? '—' : pendingRequests.length}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-gray-600 mb-1">To Review</div>
              <div className="text-3xl text-orange-600">{loading ? '—' : pendingReviews.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Students */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">My Students</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : approvedAllocations.length === 0 ? (
                  <p className="text-gray-400 text-sm">No students allocated yet.</p>
                ) : (
                  approvedAllocations.map((a) => {
                    const progress = getStudentProgress(a.student!._id);
                    return (
                      <div key={a._id} className="pb-4 border-b border-gray-200 last:border-b-0">
                        <div className="mb-2">{a.student?.name || 'Unknown student'}</div>
                        <div className="text-sm text-gray-600 mb-2">{a.project?.title || 'Deleted project'}</div>
                        <div className="bg-gray-200 h-2 rounded-full">
                          <div
                            className="bg-[#2563a8] h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{progress}% Complete</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Student Requests */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-5">Student Requests</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : pendingRequests.length === 0 ? (
                  <p className="text-gray-400 text-sm">No pending requests.</p>
                ) : (
                  pendingRequests.map((req) => (
                    <div key={req._id} className="pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="mb-1">{req.student?.name || 'Unknown student'}</div>
                      <div className="text-sm text-gray-600 mb-2">{req.project?.title || 'Deleted project'}</div>
                      <div className="text-xs text-gray-500 mb-3">
                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecision(req._id, 'approved')}
                          disabled={decidingId === req._id}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(req._id, 'rejected')}
                          disabled={decidingId === req._id}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
            <h2 className="text-xl mb-5">Pending Reviews</h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : pendingReviews.length === 0 ? (
                <p className="text-gray-400 text-sm">Nothing waiting on review.</p>
              ) : (
                pendingReviews.map((a) => (
                  <div key={a._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <div>{a.student?.name || 'Unknown student'} - {a.title}</div>
                      <div className="text-sm text-gray-600">
                        Submitted: {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <Link
                      to={`/supervisor/assessments/grade/${a._id}`}
                      className="bg-[#2563a8] text-white px-4 py-2 rounded-md hover:bg-[#1e4a8a] text-center"
                    >
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
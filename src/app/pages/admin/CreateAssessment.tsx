import Sidebar from '../../components/Sidebar';
import { useNavigate, Link } from 'react-router';
import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface ProjectOption {
  _id: string;
  title: string;
  supervisor?: { _id: string; name: string };
}

export default function CreateAssessment() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const [studentId, setStudentId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users?role=student').then((data) => setStudents(data.users));
    api.get('/projects').then((data) => setProjects(data.projects));
  }, []);

  const selectedProject = projects.find((p) => p._id === projectId);
  const selectedStudent = students.find((s) => s._id === studentId);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!selectedProject?.supervisor) {
      setError('Selected project has no supervisor assigned');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/assessments', {
        title,
        description,
        project: projectId,
        student: studentId,
        supervisor: selectedProject.supervisor._id,
        dueDate: dueDate || undefined,
        studentEmail: selectedStudent?.email,
      });
      navigate('/admin/assessments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Create New Assessment</h1>
              <p className="text-gray-600">Assign an assessment to a student</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <ProfileAvatar role="admin" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl mb-4">Assign To</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Student</label>
                      <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                        required
                      >
                        <option value="">Select a student</option>
                        {students.map((s) => (
                          <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Project</label>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                        required
                      >
                        <option value="">Select a project</option>
                        {projects.map((p) => (
                          <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Supervisor</label>
                      <input
                        type="text"
                        value={selectedProject?.supervisor?.name || 'Select a project first'}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-xl mb-4">Assessment Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                        placeholder="e.g. Milestone 1 Report"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 focus:outline-none focus:border-[#2563a8]"
                        placeholder="What the student needs to submit"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/assessments')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-60"
                  >
                    {submitting ? 'Creating...' : 'Create Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
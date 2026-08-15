import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router';
import { useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import ProfileAvatar from '../../components/ProfileAvatar';
import NotificationBell from '../../components/NotificationBell';

export default function CreateAssessment() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { assessment } = await api.post('/assessments', {
        title,
        description,
        dueDate: dueDate || undefined,
      });

      // Uploaded one at a time - concurrent pushes to the same files array
      // could otherwise clobber each other.
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.upload(`/assessments/${assessment._id}/files`, formData);
      }

      navigate('/admin/assessments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar role="admin" />
      <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Create New Assessment</h1>
              <p className="text-gray-600">Create a shared assessment template for this trimester</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell role="admin" />
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
                        placeholder="What students need to submit"
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

                    <div>
                      <label className="block text-gray-700 mb-2">Attachments</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        e.g. an assignment brief. Supervisors and students will be able to view/download these.
                      </p>
                      {files.length > 0 && (
                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                          {files.map((f, idx) => (
                            <li key={idx}>{f.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  This assessment starts hidden from every student. Each supervisor turns it on for their own
                  project from their Assessments page.
                </p>

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

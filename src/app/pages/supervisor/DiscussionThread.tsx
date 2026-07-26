import Sidebar from '../../components/Sidebar';
import { Link, useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Person {
  _id: string;
  name: string;
  email: string;
}

interface Thread {
  _id: string;
  title: string;
  content: string;
  createdBy: Person;
  createdAt: string;
  project: { _id: string; title: string; supervisor: string };
}

interface Post {
  _id: string;
  content: string;
  createdBy: Person;
  createdAt: string;
}

export default function DiscussionThread() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState('');

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/discussions/${id}`);
      setThread(data.thread);
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load this discussion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canModerate = (authorId: string) =>
    userRole === 'admin' || authorId === userId || thread?.project.supervisor === userId;

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    setReplyError('');
    try {
      await api.post(`/discussions/${id}/posts`, { content: replyContent });
      setReplyContent('');
      const data = await api.get(`/discussions/${id}`);
      setPosts(data.posts);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Delete this discussion? This will also delete all its replies.')) return;
    try {
      await api.delete(`/discussions/${id}`);
      navigate('/supervisor/discussions');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete discussion');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this reply?')) return;
    try {
      await api.delete(`/discussions/${id}/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete reply');
    }
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/supervisor/discussions')}
                className="text-[#2563a8] hover:underline mb-2 text-sm"
              >
                ← Back to Discussions
              </button>
              <h1 className="text-2xl">{thread?.title ?? 'Discussion'}</h1>
              <p className="text-gray-600">{thread ? thread.project.title : 'Discussion Thread'}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                {(localStorage.getItem('userName') ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase()}
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="bg-white rounded-lg p-12 border border-gray-200 text-center text-gray-500">
                Loading discussion...
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-12 border border-gray-200 text-center text-red-700">
                {error}
              </div>
            ) : thread ? (
              <>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {initials(thread.createdBy.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{thread.createdBy.name}</span>
                        </div>
                        {canModerate(thread.createdBy._id) && (
                          <button
                            onClick={handleDeleteThread}
                            className="text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        {new Date(thread.createdAt).toLocaleString()}
                      </div>
                      <div className="text-gray-700 leading-relaxed">{thread.content}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl mb-4">{posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}</h2>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-gray-500">
                            {initials(post.createdBy.name)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{post.createdBy.name}</span>
                              {canModerate(post.createdBy._id) && (
                                <button
                                  onClick={() => handleDeletePost(post._id)}
                                  className="text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mb-3">
                              {new Date(post.createdAt).toLocaleString()}
                            </div>
                            <div className="text-gray-700 leading-relaxed">{post.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {posts.length === 0 && (
                      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center text-gray-500">
                        No replies yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg mb-4">Post a Reply</h3>
                  {replyError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                      {replyError}
                    </div>
                  )}
                  <form onSubmit={handleSubmitReply}>
                    <div className="mb-4">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                        placeholder="Write your reply..."
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/supervisor/discussions')}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReply}
                        className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
                      >
                        {submittingReply ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

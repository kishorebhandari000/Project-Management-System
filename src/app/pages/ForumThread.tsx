import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ProfileAvatar from '../components/ProfileAvatar';
import { Link, useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Role = 'admin' | 'supervisor' | 'student';

interface ForumPost {
  _id: string;
  title: string;
  body: string;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
}

interface ForumComment {
  _id: string;
  body: string;
  author: { _id: string; name: string; email: string };
  createdAt: string;
}

export default function ForumThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');
  const userName = localStorage.getItem('userName') ?? '';
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') as Role | null;

  const loadThread = async () => {
    setLoading(true);
    setError('');
    try {
      const [postData, commentsData] = await Promise.all([
        api.get(`/forum/${id}`),
        api.get(`/forum/${id}/comments`),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load this post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThread();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setCommentError('');
    try {
      await api.post(`/forum/${id}/comments`, { body: newComment });
      setNewComment('');
      const commentsData = await api.get(`/forum/${id}/comments`);
      setComments(commentsData);
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const canDeleteComment = (comment: ForumComment) =>
    userRole === 'admin' || comment.author?._id === userId;

  const canDeletePost = post ? userRole === 'admin' || post.createdBy?._id === userId : false;

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this reply?')) return;
    try {
      await api.delete(`/forum/${id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete reply');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Delete this thread? This will also delete its replies.')) return;
    try {
      await api.delete(`/forum/${id}`);
      navigate('/forum');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete thread');
    }
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const content = (
    <div className="max-w-4xl mx-auto">
      <Link to={isLoggedIn ? '/forum' : '/'} className="text-[#2563a8] hover:underline mb-6 inline-block">
        {isLoggedIn ? '← Back to Forum' : '← Back to Homepage'}
      </Link>

      {loading ? (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-gray-500">
              Loading post...
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-red-700">
              {error}
            </div>
          ) : post ? (
            <>
              {/* Post Header */}
              <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-sm text-gray-500">
                    Posted {new Date(post.createdAt).toLocaleDateString()} by {post.createdBy?.name ?? 'Unknown'}
                  </span>
                  {canDeletePost && (
                    <button
                      onClick={handleDeletePost}
                      className="text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <h1 className="text-3xl mb-6">{post.title}</h1>

                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {post.body}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-6 text-sm text-gray-600">
                  <span>{comments.length} replies</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-6">
                <h2 className="text-xl mb-6">{comments.length} Replies</h2>

                {comments.length === 0 ? (
                  <p className="text-gray-500">No replies yet. Be the first to comment.</p>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-gray-600">
                            {initials(comment.author?.name ?? '?')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-800">{comment.author?.name ?? 'Unknown'}</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {canDeleteComment(comment) && (
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-gray-700">{comment.body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                <h3 className="text-lg mb-4">Add a Reply</h3>
                {isLoggedIn ? (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-gray-600">
                        {initials(userName)}
                      </div>
                      <span className="text-gray-800">{userName}</span>
                    </div>

                    {commentError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                        {commentError}
                      </div>
                    )}

                    <div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                        placeholder="Share your thoughts, ask questions, or provide feedback..."
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:opacity-50"
                      >
                        {submitting ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Please log in to post a reply</p>
                    <Link
                      to="/login"
                      className="inline-block bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : null}
    </div>
  );

  if (isLoggedIn) {
    const role: Role = userRole ?? 'student';
    return (
      <div className="flex flex-col md:flex-row">
        <Sidebar role={role} />
        <div className="flex-1 bg-[#f4f6f8] pt-16 md:pt-0">
          <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-end">
            <div className="flex items-center gap-4">
              <Link to={`/${role}/notifications`} className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <ProfileAvatar role={role} />
            </div>
          </div>
          <div className="p-8">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-[#f4f6f8] py-12 px-6">{content}</div>
      <Footer />
    </div>
  );
}

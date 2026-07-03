import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useParams } from 'react-router';
import { useState, useEffect } from 'react';

export default function ForumThread() {
  const { id } = useParams();
  const [newComment, setNewComment] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [allComments, setAllComments] = useState<any[]>([]);

  // Mock data - in real app this would be fetched based on id
  const post = {
    id: 1,
    title: 'Welcome to PMS - Getting Started Guide',
    category: 'Announcement',
    content: `Welcome to the Project Management System (PMS)! We're excited to have you here.

This comprehensive guide will help you navigate through the platform and make the most of its features. Whether you're a student looking for your perfect final year project, a supervisor managing multiple projects, or an administrator overseeing the entire system, PMS has tools designed specifically for you.

## Key Features:

**For Students:**
- Browse and filter available projects by category and supervisor
- Submit project requests and track application status
- Upload assessment submissions and receive feedback
- Communicate with supervisors through the discussion forum
- View marks and detailed feedback on your work

**For Supervisors:**
- Create and manage project listings
- Review student applications and allocations
- Grade submissions with detailed rubrics
- Provide comprehensive feedback to students
- Track student progress throughout the project lifecycle

**For Administrators:**
- Manage user accounts and permissions
- Oversee project allocation process
- Generate reports and analytics
- Create public announcements and guidelines
- Monitor system-wide activity

## Getting Started:

1. **Create an Account**: Click on "Get Started" and register with your university email
2. **Complete Your Profile**: Add your information and areas of interest
3. **Explore Projects**: Browse available projects or create your own
4. **Stay Updated**: Check announcements and notifications regularly

If you have any questions or need assistance, feel free to reply to this thread or contact our support team.

Happy project managing!`,
    postedBy: 'Admin Team',
    postedDate: '2 days ago',
    replies: 24,
  };

  const initialComments = [
    {
      id: 1,
      author: 'Sarah Johnson',
      role: 'Student',
      content: 'This is really helpful! I was confused about how to submit my assessments but now it\'s clear. Thank you!',
      timestamp: '2 days ago',
      likes: 12,
    },
    {
      id: 2,
      author: 'Dr. Michael Chen',
      role: 'Supervisor',
      content: 'Great overview! Just to add - supervisors can also set up custom assessment criteria for their projects. This allows for more tailored feedback based on project requirements.',
      timestamp: '1 day ago',
      likes: 8,
    },
    {
      id: 3,
      author: 'John Doe',
      role: 'Student',
      content: 'Can we submit multiple drafts for feedback before the final submission? Or is it one submission only?',
      timestamp: '1 day ago',
      likes: 5,
    },
    {
      id: 4,
      author: 'Admin Team',
      role: 'Admin',
      content: '@John Doe - Yes! You can submit drafts and receive preliminary feedback. Your supervisor can mark submissions as "Draft" or "Final" when reviewing them.',
      timestamp: '18 hours ago',
      likes: 15,
    },
    {
      id: 5,
      author: 'Emma Wilson',
      role: 'Student',
      content: 'Love the discussion forum feature! It\'s much easier to communicate with my supervisor and see what other students are working on.',
      timestamp: '12 hours ago',
      likes: 7,
    },
  ];

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');

    if (storedRole && storedName) {
      setUserRole(storedRole);
      setUserName(storedName);
    }

    // Initialize comments
    setAllComments(initialComments);
  }, []);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userRole) {
      alert('Please log in to post a comment');
      return;
    }

    if (newComment.trim()) {
      const newCommentObj = {
        id: allComments.length + 1,
        author: userName,
        role: userRole,
        content: newComment,
        timestamp: 'Just now',
        likes: 0,
      };

      setAllComments([...allComments, newCommentObj]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f4f6f8] py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/" className="text-[#2563a8] hover:underline mb-6 inline-block">
            ← Back to Homepage
          </Link>

          {/* Post Header */}
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs px-3 py-1 rounded ${
                post.category === 'Announcement'
                  ? 'bg-blue-100 text-blue-700'
                  : post.category === 'Important'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {post.category}
              </span>
              <span className="text-sm text-gray-500">Posted {post.postedDate} by {post.postedBy}</span>
            </div>

            <h1 className="text-3xl mb-6">{post.title}</h1>

            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {post.content}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-6 text-sm text-gray-600">
              <span>{post.replies} replies</span>
              <button className="text-[#2563a8] hover:underline">Share</button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-6">
            <h2 className="text-xl mb-6">{allComments.length} Replies</h2>

            <div className="space-y-6">
              {allComments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                      comment.role === 'Admin'
                        ? 'bg-red-600'
                        : comment.role === 'Supervisor'
                        ? 'bg-[#2563a8]'
                        : 'bg-gray-600'
                    }`}>
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-800">{comment.author}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          comment.role === 'Admin'
                            ? 'bg-red-100 text-red-700'
                            : comment.role === 'Supervisor'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {comment.role}
                        </span>
                        <span className="text-sm text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <button className="text-gray-600 hover:text-[#2563a8]">
                          👍 {comment.likes}
                        </button>
                        <button className="text-gray-600 hover:text-[#2563a8]">Reply</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Comment Form */}
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <h3 className="text-lg mb-4">Add a Reply</h3>
            {userRole ? (
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                    userRole === 'Admin'
                      ? 'bg-red-600'
                      : userRole === 'Supervisor'
                      ? 'bg-[#2563a8]'
                      : 'bg-gray-600'
                  }`}>
                    {userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800">{userName}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        userRole === 'Admin'
                          ? 'bg-red-100 text-red-700'
                          : userRole === 'Supervisor'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {userRole}
                      </span>
                    </div>
                  </div>
                </div>
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
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                  >
                    Post Reply
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Please log in to post a reply
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

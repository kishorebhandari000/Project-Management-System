import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GetStartedButton from '../components/GetStartedButton';
import { api } from '../lib/api';
import aboutImage from '../../assets/image.jpeg';
import SubmitButton from '../components/SubmitButton';
interface ForumPost {
  _id: string;
  title: string;
  body: string;
  createdBy: { name: string; email: string };
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function Homepage() {
  const location = useLocation();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await api.get('/forum', { auth: false });
        setPosts(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load forum posts', err);
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    setContactError('');

    try {
      await api.post('/contact', contactForm, { auth: false });
      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactStatus('error');
      setContactError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-[88px]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#2563a8] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl mb-6">Manage Your Final Year Project — All in One Place</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            A comprehensive platform for students, supervisors, and administrators to streamline project selection,
            assessment submission, and feedback management.
          </p>
          <GetStartedButton as={Link} to="/login">
            Get Started
          </GetStartedButton>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white scroll-mt-[88px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16">Our Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h3 className="text-xl mb-3">Project Selection</h3>
              <p className="text-gray-600">
                Browse available projects and submit requests to supervisors.
                Track your application status in real-time.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h3 className="text-xl mb-3">Assessment Submission</h3>
              <p className="text-gray-600">
                Submit your assessments and deliverables easily.
                Keep track of deadlines and submission status.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h3 className="text-xl mb-3">Feedback & Marks</h3>
              <p className="text-gray-600">
                Receive detailed feedback from your supervisor.
                View your marks and progress throughout the project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
<section id="about" className="py-20 px-6 bg-[#f4f6f8] scroll-mt-[88px]">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl mb-6">About Project Management System</h2>
        <p className="text-gray-700 mb-4">
          The Project Management System is designed to simplify the management of final year projects
          at universities. It provides a centralized platform for students to select projects, submit assessments,
          and receive feedback — replacing scattered emails, spreadsheets, and paper forms with one connected system.
        </p>
        <p className="text-gray-700 mb-6">
          Supervisors can manage their projects and students efficiently, while administrators have full oversight
          of all project activities and user management across the department.
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="text-[#2563a8] mt-1">✓</span>
            <span className="text-gray-700">
              <strong>Centralized project repository</strong> — supervisors publish projects, students browse and request the ones that interest them
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#2563a8] mt-1">✓</span>
            <span className="text-gray-700">
              <strong>Role-based dashboards</strong> — students, supervisors, and admins each see exactly what's relevant to them
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#2563a8] mt-1">✓</span>
            <span className="text-gray-700">
              <strong>Assessment tracking</strong> — deadlines, submissions, marking, and feedback all in one timeline
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#2563a8] mt-1">✓</span>
            <span className="text-gray-700">
              <strong>Discussion forums</strong> — students and supervisors collaborate on project-related questions in one place
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#2563a8] mt-1">✓</span>
            <span className="text-gray-700">
              <strong>Real-time notifications</strong> — everyone stays updated on approvals, marks, and messages as they happen
            </span>
          </li>
        </ul>
      </div>

      <img
        src={aboutImage}
        alt="Project Management System overview"
        className="h-80 w-full object-cover rounded-lg"
      />
    </div>
  </div>
</section>

      {/* Community Forum Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl text-center mb-12">Community Forum</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Join the discussion! Browse announcements, tips, and important updates from our administrators.
          </p>

          <div className="space-y-4">
            {postsLoading ? (
              <p className="text-center text-gray-400">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-gray-400">No forum posts yet. Check back soon!</p>
            ) : (
              posts.map((post) => (
                <Link key={post._id} to={`/forum/${post._id}`} className="block">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl mb-2">{post.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{post.body}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Posted by <span className="text-gray-800">{post.createdBy?.name || 'Unknown'}</span></span>
                          <span>•</span>
                          <span>{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/login" className="inline-block text-[#2563a8] hover:underline">
              View All Discussions →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-[#f4f6f8] scroll-mt-[88px]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl text-center mb-12">Contact Us</h2>

          {contactStatus === 'success' ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-4 text-center">
              Thanks for reaching out! We'll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-5">
              {contactStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                  {contactError}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                  placeholder="Your message..."
                  required
                ></textarea>
              </div>
                <SubmitButton disabled={contactStatus === 'sending'}>
                  {contactStatus === 'sending' ? 'Sending...' : 'Submit'}
                </SubmitButton>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
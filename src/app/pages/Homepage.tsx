import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronDown,
  FolderKanban,
  ClipboardCheck,
  Award,
  ArrowRight,
  MessageCircle,
  LogIn,
  LayoutDashboard,
  Bell,
  BookOpen,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GetStartedButton from '../components/GetStartedButton';
import { api } from '../lib/api';
import aboutImage from '../../assets/image.jpeg';
import SubmitButton from '../components/SubmitButton';
import './Homepage.css';

interface ForumPost {
  _id: string;
  title: string;
  body: string;
  createdBy: { name: string; email: string };
  createdAt: string;
}

const HOW_IT_WORKS = [
  {
    icon: LogIn,
    title: 'Sign In',
    description: 'Use the @pms.edu login your administrator created for you — there\'s no self sign-up.',
  },
  {
    icon: LayoutDashboard,
    title: 'Go to Your Dashboard',
    description: 'Students browse and apply for projects, supervisors manage their students, admins oversee it all.',
  },
  {
    icon: ClipboardCheck,
    title: 'Work Through Your Flow',
    description: 'Apply, get allocated, submit assessments, and receive feedback — every step tracked in one place.',
  },
  {
    icon: Bell,
    title: 'Stay in the Loop',
    description: 'Get notified the moment something changes: approvals, new assessments, marks, and messages.',
  },
];

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Project Selection',
    description:
      'Browse available projects and apply as a group with your teammates. Applications go through supervisor review, then final admin approval, with your status tracked the whole way.',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessment Submission',
    description:
      'Submit tutorials, reports, and presentations as your supervisor releases them throughout the trimester. Keep track of due dates and submission status for every assessment.',
  },
  {
    icon: Award,
    title: 'Feedback & Marks',
    description:
      'Receive detailed written feedback from your supervisor as soon as each submission is graded. View your marks and track your progress across every assessment.',
  },
];

const ABOUT_POINTS = [
  {
    title: 'Centralized project repository',
    description: 'supervisors publish projects, students browse and request the ones that interest them',
  },
  {
    title: 'Role-based dashboards',
    description: "students, supervisors, and admins each see exactly what's relevant to them",
  },
  {
    title: 'Assessment tracking',
    description: 'deadlines, submissions, marking, and feedback all in one timeline',
  },
  {
    title: 'Discussion forums',
    description: 'students and supervisors collaborate on project-related questions in one place',
  },
  {
    title: 'Real-time notifications',
    description: 'everyone stays updated on approvals, marks, and messages as they happen',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2563a8] via-[#1e4a8a] to-[#173a6e] text-white py-28 px-6">
        <div
          className="hero-blob absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="hero-blob absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#60a5fa]/20 blur-3xl pointer-events-none"
          style={{ animationDelay: '4s' }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            Built for students, supervisors & admins
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl mb-6 leading-tight"
          >
            Manage Your Final Year Project<br className="hidden sm:block" />
            <span className="text-[#a8c8f0]"> — All in One Place</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-10 max-w-2xl mx-auto text-white/90"
          >
            One connected platform to select projects, submit assessments, and get feedback — so you can spend
            less time chasing emails and more time on the work that matters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <GetStartedButton as={Link} to="/login">
              Get Started
            </GetStartedButton>
            <a
              href="#features"
              className="group inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              See how it works
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>

        <a
          href="#features"
          className="scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors"
          aria-label="Scroll to features"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#f4f6f8]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="text-[#2563a8] text-sm font-medium tracking-wide uppercase">New here?</span>
            <h2 className="text-3xl mt-3">How It Works</h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              Four steps to get from first login to your first submission.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-white border border-[#2563a8]/20 text-[#2563a8] flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-xs text-gray-400 mb-1">Step {i + 1}</div>
                <h3 className="text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <Link
              to="/guide"
              className="group inline-flex items-center gap-2 bg-white border border-gray-200 text-[#2563a8] px-6 py-3 rounded-md shadow-sm hover:shadow-md hover:border-[#2563a8]/30 transition-[box-shadow,border-color]"
            >
              <BookOpen className="w-4 h-4" />
              Read the Full Guide
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white scroll-mt-[88px]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-[#2563a8] text-sm font-medium tracking-wide uppercase">Everything you need</span>
            <h2 className="text-4xl mt-3">Our Features</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="group bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg hover:border-[#2563a8]/30 transition-[box-shadow,border-color]"
              >
                <div className="w-12 h-12 rounded-lg bg-[#2563a8]/10 text-[#2563a8] flex items-center justify-center mb-5 transition-colors group-hover:bg-[#2563a8] group-hover:text-white">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl mb-3">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-[#f4f6f8] scroll-mt-[88px]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl mb-6">About Project Management System</h2>
              <p className="text-gray-700 mb-4">
                The Project Management System is designed to simplify the management of final year projects
                at universities. It provides a centralized platform for students to select projects, submit
                assessments, and receive feedback — replacing scattered emails, spreadsheets, and paper forms
                with one connected system.
              </p>
              <p className="text-gray-700 mb-6">
                Supervisors can manage their projects and students efficiently, while administrators have full
                oversight of all project activities and user management across the department.
              </p>

              <ul className="space-y-4 mb-6">
                {ABOUT_POINTS.map((point, i) => (
                  <motion.li
                    key={point.title}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#2563a8] text-white text-xs flex items-center justify-center">
                      ✓
                    </span>
                    <span className="text-gray-700">
                      <strong>{point.title}</strong> — {point.description}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-xl bg-[#2563a8]/10 -z-10" aria-hidden="true" />
              <img
                src={aboutImage}
                alt="Project Management System overview"
                className="h-80 w-full object-cover rounded-lg shadow-md transition-transform duration-500 hover:scale-[1.02]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Forum Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-[#2563a8] text-sm font-medium tracking-wide uppercase">Join the conversation</span>
            <h2 className="text-3xl mt-3 mb-4">Community Forum</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse announcements, tips, and important updates from our administrators — and jump into the
              discussion yourself.
            </p>
          </motion.div>

          <div className="space-y-4">
            {postsLoading ? (
              <p className="text-center text-gray-400">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-gray-400">No forum posts yet. Check back soon!</p>
            ) : (
              posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link to={`/forum/${post._id}`} className="block">
                    <div className="flex items-start gap-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-[#2563a8]/30 transition-[box-shadow,border-color] cursor-pointer">
                      <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-[#2563a8]/10 text-[#2563a8] items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl mb-2">{post.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{post.body}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Posted by <span className="text-gray-800">{post.createdBy?.name || 'Unknown'}</span>
                          </span>
                          <span>•</span>
                          <span>{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/forum"
              className="group inline-flex items-center gap-1.5 text-[#2563a8] hover:underline"
            >
              View All Discussions
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-[#2563a8] text-white py-14 px-6 text-center"
      >
        <h2 className="text-2xl sm:text-3xl mb-3">Ready to take the stress out of your final year project?</h2>
        <p className="text-white/90 mb-8 max-w-xl mx-auto">
          Sign in to your account and see everything in one place — projects, submissions, and feedback.
        </p>
        <GetStartedButton as={Link} to="/login">
          Get Started
        </GetStartedButton>
      </motion.section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-[#f4f6f8] scroll-mt-[88px]">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-3xl text-center mb-12"
          >
            Contact Us
          </motion.h2>

          <AnimatePresence mode="wait">
            {contactStatus === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-4 text-center"
              >
                Thanks for reaching out! We'll get back to you soon.
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                onSubmit={handleContactSubmit}
                className="space-y-5"
              >
                {contactStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                    {contactError}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
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
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
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
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Your message..."
                    required
                  ></motion.textarea>
                </div>
                <SubmitButton disabled={contactStatus === 'sending'}>
                  {contactStatus === 'sending' ? 'Sending...' : 'Submit'}
                </SubmitButton>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}

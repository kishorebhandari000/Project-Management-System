import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GetStartedButton from '../components/GetStartedButton';
import { Link } from 'react-router';

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col">
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
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16">Our Features</h2>
          <div className="grid grid-cols-3 gap-10">
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
      <section className="py-20 px-6 bg-[#f4f6f8]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl mb-6">About PMS</h2>
              <p className="text-gray-700 mb-4">
                The Project Management System (PMS) is designed to simplify the management of final year projects
                at universities. It provides a centralized platform for students to select projects, submit assessments,
                and receive feedback.
              </p>
              <p className="text-gray-700">
                Supervisors can manage their projects and students efficiently, while administrators have full oversight
                of all project activities and user management.
              </p>
            </div>
            <div className="bg-gray-300 h-80 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Image Placeholder</span>
            </div>
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
            <Link to="/forum/1" className="block">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl">Welcome to PMS - Getting Started Guide</h3>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Announcement</span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      New to the Project Management System? This guide will help you navigate the platform and make the most of its features.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Posted by <span className="text-gray-800">Admin Team</span></span>
                      <span>•</span>
                      <span>2 days ago</span>
                      <span>•</span>
                      <span>24 replies</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/forum/2" className="block">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl">Project Submission Deadline Extended</h3>
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">Important</span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      The final project submission deadline has been extended to accommodate student requests. Please see the new timeline.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Posted by <span className="text-gray-800">Admin Team</span></span>
                      <span>•</span>
                      <span>5 days ago</span>
                      <span>•</span>
                      <span>18 replies</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/forum/3" className="block">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl">Tips for Choosing the Right Project</h3>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">General</span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      Learn how to select a project that aligns with your interests and career goals. Read insights from successful students.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Posted by <span className="text-gray-800">Admin Team</span></span>
                      <span>•</span>
                      <span>1 week ago</span>
                      <span>•</span>
                      <span>42 replies</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center mt-8">
            <Link to="/login" className="inline-block text-[#2563a8] hover:underline">
              View All Discussions →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-[#f4f6f8]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl text-center mb-12">Contact Us</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-4 py-3 h-32 focus:outline-none focus:border-[#2563a8]"
                placeholder="Your message..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a]"
            >
              Submit
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

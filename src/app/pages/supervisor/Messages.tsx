import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router';
import { useState } from 'react';
import { sendDirectMessage } from '../../utils/emailService';

export default function Messages() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await sendDirectMessage({
        recipientEmail,
        recipientName: 'Student',
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'Supervisor',
        subject,
        message,
        replyUrl: window.location.origin + '/student/messages',
      });

      setSuccessMessage('Email sent successfully to student!');
      setRecipientEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send email';

      if (errorMsg.includes('only send testing emails to your own email')) {
        setErrorMessage('⚠️ Resend free tier: You can only send emails to 20032573@students.koi.edu.au (your verified email). To send to others, verify a domain at resend.com/domains');
      } else {
        setErrorMessage('Failed to send email. Please try again.');
      }
      console.error('Email send error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="supervisor" />
      <div className="flex-1 bg-[#f4f6f8]">
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">Messages</h1>
              <p className="text-gray-600">Send email to your students</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/supervisor/notifications" className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
              </Link>
              <Link to="/supervisor/profile" className="w-12 h-12 bg-[#2563a8] rounded-full flex items-center justify-center text-white hover:bg-[#1e4a8a] cursor-pointer">
                SJ
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-6">Send Email to Student</h2>

              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Student Email *</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="student@university.edu"
                    required
                  />
                  <p className="text-sm text-orange-600 mt-1">⚠️ Testing mode: Use 20032573@students.koi.edu.au to receive the email yourself</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Enter email subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-48 focus:outline-none focus:border-[#2563a8]"
                    placeholder="Write your message here..."
                    required
                  ></textarea>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm mb-2 text-blue-900">Email Guidelines:</h3>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Provide clear guidance and constructive feedback</li>
                    <li>Include all relevant details and resources</li>
                    <li>Your student will receive this email directly</li>
                    <li>They can reply to your university email address</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientEmail('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300"
                    disabled={sending}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] disabled:bg-gray-400"
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send Email'}
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

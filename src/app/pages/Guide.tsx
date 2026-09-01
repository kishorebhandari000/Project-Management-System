import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import {
  LogIn,
  UserCog,
  FolderKanban,
  Users,
  ClipboardList,
  Award,
  Bell,
  ShieldCheck,
  ListChecks,
  LifeBuoy,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';

type Role = 'student' | 'supervisor' | 'administrator';

interface GuideRow {
  task: string;
  how: string;
  role?: Role;
}

const ROLE_STYLES: Record<Role, string> = {
  student: 'bg-blue-50 text-blue-700 border-blue-200',
  supervisor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  administrator: 'bg-slate-100 text-slate-700 border-slate-300',
};

const ROLE_LABELS: Record<Role, string> = {
  student: 'Student',
  supervisor: 'Supervisor',
  administrator: 'Administrator',
};

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${ROLE_STYLES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

function GuideRows({ rows }: { rows: GuideRow[] }) {
  return (
    <div className="space-y-5">
      {rows.map((row, i) => (
        <motion.div
          key={row.task}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
          className="pb-5 border-b border-gray-100 last:border-b-0 last:pb-0"
        >
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="text-gray-900">{row.task}</h4>
            {row.role && <RoleBadge role={row.role} />}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{row.how}</p>
        </motion.div>
      ))}
    </div>
  );
}

const NAV_SECTIONS = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'projects', label: 'Projects' },
  { id: 'applying', label: 'Applying & Allocation' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'submitting', label: 'Submitting & Marking' },
  { id: 'staying-informed', label: 'Staying Informed' },
  { id: 'permissions', label: 'Who Can Do What' },
  { id: 'rules', label: 'The Rules' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
];

const GETTING_STARTED: GuideRow[] = [
  {
    task: 'Sign in',
    how: 'Open the site, click Login, and enter your generated @pms.edu address and password. Your personal email address will not work.',
  },
  {
    task: 'Forgotten password',
    how: 'Login → Forgot password? → enter your address. Open the emailed link (valid for one hour) and set a new password: at least 8 characters with an upper-case letter, a lower-case letter, a number and a symbol.',
  },
  {
    task: 'Finding your way',
    how: 'The sidebar on the left lists your pages; hover an item for a short description. The bell at the top shows notifications. Your profile picture opens your profile and Logout.',
  },
  {
    task: 'Your profile',
    how: 'Profile picture → Profile. Edit your name, phone, address and personal email, and change your password. Your login address cannot be changed.',
  },
  {
    task: 'On a phone',
    how: 'The sidebar becomes a menu button in the top-left corner. Wide tables scroll sideways.',
  },
];

const ACCOUNTS: GuideRow[] = [
  {
    task: 'Create an account',
    how: 'Manage Users → Add User → choose Student or Supervisor → type the person’s name → Create. Copy the generated student ID, login address and first password from the confirmation box and pass them on — the password is not shown again. If it is lost, the person uses Forgot password?',
  },
  {
    task: 'Edit an account',
    how: 'Manage Users → find the person with the search box → Edit → change the name, email or role → Save. Changing a role changes what that person can see.',
  },
  {
    task: 'Remove an account',
    how: 'Manage Users → Delete → confirm. Remove any project allocation first. This cannot be undone.',
  },
];

const PROJECTS: GuideRow[] = [
  {
    task: 'Create a project',
    role: 'administrator',
    how: 'Manage Projects → Create Project → title, description, category, supervisor and number of places → Create. It is visible to students immediately. Create the supervisor’s account first.',
  },
  {
    task: 'Edit or reassign',
    role: 'administrator',
    how: 'Manage Projects → Edit → change any detail, including the supervisor → Save changes. A new supervisor sees the project, its students and their submissions at once.',
  },
  {
    task: 'Attach a file',
    role: 'administrator',
    how: 'Manage Projects → Upload file. Up to 25 MB.',
  },
  {
    task: 'Delete a project',
    role: 'administrator',
    how: 'Manage Projects → Delete. Not possible once students are allocated or an assessment has been released to it — move the students first, or close the project instead.',
  },
  {
    task: 'See your projects',
    role: 'supervisor',
    how: 'Manage Projects shows only the projects assigned to you, with their enrolled students and any applications awaiting your review.',
  },
  {
    task: 'Browse projects',
    role: 'student',
    how: 'Browse Projects. Only projects that are still open appear; a project disappears from the list once its places are full.',
  },
];

const APPLYING: GuideRow[] = [
  {
    task: 'Apply for a project',
    role: 'student',
    how: 'Browse Projects → Apply as a Group → search teammates by name, student ID or email (type at least two characters) → name the group → Submit application. Students who are already allocated or already in another application appear greyed out and cannot be added.',
  },
  {
    task: 'Join an existing group',
    role: 'student',
    how: 'Browse Projects → Join on the group shown on the project card. If the supervisor had already recommended that group, it returns to pending so they can review the group as it now stands.',
  },
  {
    task: 'Leave or withdraw',
    role: 'student',
    how: 'My Group → Leave group. The person who started the group can choose Withdraw application to cancel it for everybody.',
  },
  {
    task: 'Review an application',
    role: 'supervisor',
    how: 'Manage Projects → Pending your review → open the application → Recommend it to the administrator, or Reject with a short reason that is passed to the students. Undo decision reverses it while the administrator has not yet acted.',
  },
  {
    task: 'Make the final decision',
    role: 'administrator',
    how: 'Manage Allocation → Awaiting final allocation → Approve or Reject. Approving allocates every member of the group at once and closes the project if its places are now full.',
  },
  {
    task: 'Undo, or assign directly',
    role: 'administrator',
    how: 'Manage Allocation → Undo on an approved group releases the places. Assign a student places someone on a project without an application — it replaces any allocation they already hold.',
  },
  {
    task: 'See your students',
    role: 'supervisor',
    how: 'Manage Projects → My Students lists everyone allocated to any of your projects, with search and a link to message them.',
  },
];

const ASSESSMENTS: GuideRow[] = [
  {
    task: 'Create an assessment',
    role: 'administrator',
    how: 'Assessments → Create Assessment → title, description, category (tutorial, report or presentation) and due date → Create, then attach the brief. It stays hidden from everyone and notifies nobody until a supervisor releases it, so you can prepare assessments in advance.',
  },
  {
    task: 'Release it to a project',
    role: 'supervisor',
    how: 'Assessments → find the row for that assessment and project → switch Visible on. Every student on that project is notified by email and in the app. Switching it off hides it again; work already submitted is kept.',
  },
  {
    task: 'Extend a deadline',
    role: 'supervisor',
    how: 'Assessments → Extend deadline. The new date must be later than the original and applies to that project only. Students on other projects keep the original date.',
  },
  {
    task: 'See your assessments',
    role: 'student',
    how: 'Assessments lists everything released to your project with the deadline that applies to you, any attached files, and your mark once it is given. If something is missing it has not been released yet — ask your supervisor.',
  },
];

const SUBMITTING: GuideRow[] = [
  {
    task: 'Submit your work',
    role: 'student',
    how: 'Assessments → Choose file → Submit. Up to 25 MB. You can replace the file as often as you need to until it is marked; after that it is final.',
  },
  {
    task: 'Mark a submission',
    role: 'supervisor',
    how: 'Assessments → View Submissions → open a submission → read the file → enter a mark out of 100 and your feedback → Save grade. Saving releases both to the student immediately and notifies them, so write the feedback before you save.',
  },
  {
    task: 'See your mark',
    role: 'student',
    how: 'Assessments shows the mark, the written feedback and a link to the file you submitted, all together.',
  },
  {
    task: 'See all submissions',
    role: 'administrator',
    how: 'Assessments shows every assessment across the cohort: who has submitted, when, the mark given and a link to each file.',
  },
];

const PERMISSIONS: { task: string; student: string; supervisor: string; admin: string }[] = [
  { task: 'Create and manage accounts', student: '—', supervisor: '—', admin: 'Yes' },
  { task: 'Create, edit and delete projects', student: '—', supervisor: '—', admin: 'Yes' },
  { task: 'Apply for a project / form a group', student: 'Yes', supervisor: '—', admin: '—' },
  { task: 'Recommend an application', student: '—', supervisor: 'Own projects', admin: 'Yes' },
  { task: 'Make the final allocation, or undo it', student: '—', supervisor: '—', admin: 'Yes' },
  { task: 'Create an assessment', student: '—', supervisor: '—', admin: 'Yes' },
  { task: 'Release an assessment to a project', student: '—', supervisor: 'Own projects', admin: 'Any project' },
  { task: 'Extend a deadline', student: '—', supervisor: 'Own projects', admin: '—' },
  { task: 'Submit work', student: 'Yes', supervisor: '—', admin: '—' },
  { task: 'Mark work', student: '—', supervisor: 'Own students', admin: 'Yes' },
  { task: 'View marks and feedback', student: 'Own only', supervisor: 'Own students', admin: 'All' },
  { task: 'View cohort reports', student: '—', supervisor: '—', admin: 'Yes' },
];

const RULES: string[] = [
  'A student may hold one allocation and one live application at a time.',
  'A project may have at most two applications under consideration at once.',
  'Changing a group’s members sends a recommended application back for review.',
  'A project cannot be deleted while students are allocated to it or an assessment has been released to it.',
  'An assessment is invisible until a supervisor releases it; an extension applies to one project only and can never be earlier than the original date.',
  'Uploaded files can be up to 25 MB. Work can be replaced any number of times before it is marked, and never after.',
  'Marks are 0–100 and are released to the student the moment they are saved. Password reset links expire after one hour.',
];

const TROUBLESHOOTING: { q: string; a: string }[] = [
  { q: 'I cannot sign in.', a: 'Use your generated @pms.edu address, not a personal one. If the password is wrong, use Forgot password?' },
  { q: 'The page loads but nobody can sign in.', a: 'The application server is not running. Contact whoever administers the system.' },
  { q: 'My menu is not what I expected.', a: 'Your account has a different role. Ask an administrator to check it.' },
  { q: 'I cannot apply for a second project.', a: 'You already hold an allocation or a live application. Withdraw or leave the first one.' },
  { q: 'A classmate is greyed out in the search.', a: 'They are already allocated, or already in another application.' },
  { q: 'An assessment I expected is missing.', a: 'It has not been released to your project yet. Your supervisor controls when it appears.' },
  { q: 'The upload does nothing.', a: 'The file is over 25 MB. Compress it and try again.' },
  { q: 'A project will not delete.', a: 'It has students allocated or an assessment released. That is intentional.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

interface SectionCardProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  number: number;
  title: string;
  intro?: string;
  children: React.ReactNode;
}

function SectionCard({ id, icon: Icon, number, title, intro, children }: SectionCardProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      className="scroll-mt-[104px] bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 rounded-lg bg-[#2563a8]/10 text-[#2563a8] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Section {number}</div>
          <h2 className="text-xl">{title}</h2>
        </div>
      </div>
      {intro && <p className="text-gray-600 mb-6 leading-relaxed">{intro}</p>}
      {children}
    </motion.section>
  );
}

export default function Guide() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col pt-[88px]">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-[#2563a8] via-[#1e4a8a] to-[#173a6e] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5 backdrop-blur-sm"
          >
            <LifeBuoy className="w-4 h-4" />
            For students, supervisors & administrators
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl mb-4"
          >
            Quick User Guide
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-white/90 max-w-2xl mx-auto"
          >
            The system keeps everything about a capstone project in one place: the project catalogue, who's
            allocated to each project, assessments and their deadlines, and submitted work with its marks and
            feedback. What you can see and do depends on your role. Accounts are created by an administrator —
            there is no sign-up page.
          </motion.p>
        </div>
      </section>

      {/* Quick nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-[88px] z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {NAV_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-sm text-gray-600 hover:text-[#2563a8] hover:bg-[#2563a8]/5 px-3 py-1.5 rounded-full transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[#f4f6f8] py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <SectionCard id="getting-started" icon={LogIn} number={1} title="Getting Started">
            <GuideRows rows={GETTING_STARTED} />
          </SectionCard>

          <SectionCard id="accounts" icon={UserCog} number={2} title="Accounts (Administrator only)">
            <GuideRows rows={ACCOUNTS} />
          </SectionCard>

          <SectionCard id="projects" icon={FolderKanban} number={3} title="Projects">
            <GuideRows rows={PROJECTS} />
          </SectionCard>

          <SectionCard
            id="applying"
            icon={Users}
            number={4}
            title="Applying and Allocation"
            intro="Student applies → supervisor recommends → administrator allocates. Every application is a group application; applying alone simply makes a group of one."
          >
            <GuideRows rows={APPLYING} />
          </SectionCard>

          <SectionCard
            id="assessments"
            icon={ClipboardList}
            number={5}
            title="Assessments"
            intro="Administrator creates it once → each supervisor releases it to their own projects → students on those projects see it. This is why two students can see the same assessment at different times, or with different deadlines, and both are correct."
          >
            <GuideRows rows={ASSESSMENTS} />
          </SectionCard>

          <SectionCard id="submitting" icon={Award} number={6} title="Submitting and Marking">
            <GuideRows rows={SUBMITTING} />
          </SectionCard>

          <SectionCard id="staying-informed" icon={Bell} number={7} title="Staying Informed">
            <p className="text-gray-600 leading-relaxed">
              Every significant event — an application, a decision, an assessment release, a submission, a mark —
              produces a notification on the bell and an email. Nothing needs to be switched on. The system also
              checks hourly for work that is due and reminds a student once when a deadline is within five days
              and once if it passes, stopping as soon as they submit. Discussions are private to one project and
              its supervisor; the Forum is for cohort-wide announcements; Messages is real-time chat with the
              people you actually work with — your supervisor, your group and administrators.
            </p>
          </SectionCard>

          <SectionCard id="permissions" icon={ShieldCheck} number={8} title="Who Can Do What">
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-2 py-3 text-gray-500 font-normal">Task</th>
                    <th className="text-left px-2 py-3 text-gray-500 font-normal">Student</th>
                    <th className="text-left px-2 py-3 text-gray-500 font-normal">Supervisor</th>
                    <th className="text-left px-2 py-3 text-gray-500 font-normal">Administrator</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((row, i) => (
                    <motion.tr
                      key={row.task}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-2 py-3 text-gray-800">{row.task}</td>
                      <td className="px-2 py-3 text-gray-600">{row.student}</td>
                      <td className="px-2 py-3 text-gray-600">{row.supervisor}</td>
                      <td className="px-2 py-3 text-gray-600">{row.admin}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard id="rules" icon={ListChecks} number={9} title="The Rules the System Enforces">
            <ul className="space-y-4">
              {RULES.map((rule, i) => (
                <motion.li
                  key={rule}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#2563a8] text-white text-xs flex items-center justify-center">
                    ✓
                  </span>
                  <span className="text-gray-700 text-sm leading-relaxed">{rule}</span>
                </motion.li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard id="troubleshooting" icon={LifeBuoy} number={10} title="If Something Does Not Look Right">
            <Accordion type="single" collapsible className="w-full">
              {TROUBLESHOOTING.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`}>
                  <AccordionTrigger className="text-gray-800">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SectionCard>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center pt-4"
          >
            <p className="text-gray-500 text-sm mb-4">Ready to get going?</p>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 bg-[#2563a8] text-white px-6 py-3 rounded-md hover:bg-[#1e4a8a] transition-colors"
            >
              Sign In
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

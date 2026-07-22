import { createBrowserRouter } from "react-router";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import ColorPalette from "./pages/ColorPalette";
import ForumThread from "./pages/ForumThread";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/student/Dashboard";
import BrowseProjects from "./pages/student/BrowseProjects";
import Assessments from "./pages/student/Assessments";
import Feedback from "./pages/student/Feedback";
import StudentDiscussions from "./pages/student/Discussions";
import StudentDiscussionThread from "./pages/student/DiscussionThread";
import StudentNewDiscussion from "./pages/student/NewDiscussion";
import StudentMessages from "./pages/student/Messages";
import StudentNotifications from "./pages/student/Notifications";
import StudentProfile from "./pages/student/Profile";
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import ManageProjects from "./pages/supervisor/ManageProjects";
import SupervisorAssessments from "./pages/supervisor/Assessments";
import GradeSubmission from "./pages/supervisor/GradeSubmission";
import SupervisorFeedback from "./pages/supervisor/Feedback";
import SupervisorDiscussions from "./pages/supervisor/Discussions";
import SupervisorDiscussionThread from "./pages/supervisor/DiscussionThread";
import SupervisorNewDiscussion from "./pages/supervisor/NewDiscussion";
import SupervisorMessages from "./pages/supervisor/Messages";
import SupervisorNotifications from "./pages/supervisor/Notifications";
import SupervisorProfile from "./pages/supervisor/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminManageProjects from "./pages/admin/ManageProjects";
import CreateProject from "./pages/admin/CreateProject";
import ManageAllocation from "./pages/admin/ManageAllocation";
import AdminAssessments from "./pages/admin/Assessments";
import Reports from "./pages/admin/Reports";
import ManageForum from "./pages/admin/ManageForum";
import NewForumPost from "./pages/admin/NewForumPost";
import AdminDiscussions from "./pages/admin/Discussions";
import AdminNewDiscussion from "./pages/admin/NewDiscussion";
import AdminMessages from "./pages/admin/Messages";
import Notifications from "./pages/admin/Notifications";
import Profile from "./pages/admin/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export const router = createBrowserRouter([

  {
  path: "/forgot-password",
  Component: ForgotPassword,
},
{
  path: "/reset-password/:token",
  Component: ResetPassword,
},

  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/about",
    Component: Homepage,
  },
  {
    path: "/features",
    Component: Homepage,
  },
  {
    path: "/contact",
    Component: Homepage,
  },
  {
    path: "/colors",
    Component: ColorPalette,
  },
  {
    path: "/forum/:id",
    Component: ForumThread,
  },
  {
    path: "/student/dashboard",
    Component: () => <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>,
  },
  {
    path: "/student/projects",
    Component: () => <ProtectedRoute role="student"><BrowseProjects /></ProtectedRoute>,
  },
  {
    path: "/student/assessments",
    Component: () => <ProtectedRoute role="student"><Assessments /></ProtectedRoute>,
  },
  {
    path: "/student/feedback",
    Component: () => <ProtectedRoute role="student"><Feedback /></ProtectedRoute>,
  },
  {
    path: "/student/discussions",
    Component: () => <ProtectedRoute role="student"><StudentDiscussions /></ProtectedRoute>,
  },
  {
    path: "/student/discussions/new",
    Component: () => <ProtectedRoute role="student"><StudentNewDiscussion /></ProtectedRoute>,
  },
  {
    path: "/student/discussions/:id",
    Component: () => <ProtectedRoute role="student"><StudentDiscussionThread /></ProtectedRoute>,
  },
  {
    path: "/student/messages",
    Component: () => <ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>,
  },
  {
    path: "/student/notifications",
    Component: () => <ProtectedRoute role="student"><StudentNotifications /></ProtectedRoute>,
  },
  {
    path: "/student/profile",
    Component: () => <ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>,
  },
  {
    path: "/supervisor/dashboard",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorDashboard /></ProtectedRoute>,
  },
  {
    path: "/supervisor/projects",
    Component: () => <ProtectedRoute role="supervisor"><ManageProjects /></ProtectedRoute>,
  },
  {
    path: "/supervisor/assessments",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorAssessments /></ProtectedRoute>,
  },
  {
    path: "/supervisor/assessments/grade/:id",
    Component: () => <ProtectedRoute role="supervisor"><GradeSubmission /></ProtectedRoute>,
  },
  {
    path: "/supervisor/feedback",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorFeedback /></ProtectedRoute>,
  },
  {
    path: "/supervisor/discussions",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorDiscussions /></ProtectedRoute>,
  },
  {
    path: "/supervisor/discussions/new",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorNewDiscussion /></ProtectedRoute>,
  },
  {
    path: "/supervisor/discussions/:id",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorDiscussionThread /></ProtectedRoute>,
  },
  {
    path: "/supervisor/messages",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorMessages /></ProtectedRoute>,
  },
  {
    path: "/supervisor/notifications",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorNotifications /></ProtectedRoute>,
  },
  {
    path: "/supervisor/profile",
    Component: () => <ProtectedRoute role="supervisor"><SupervisorProfile /></ProtectedRoute>,
  },
  {
    path: "/admin/dashboard",
    Component: () => <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: "/admin/users",
    Component: () => <ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>,
  },
  {
    path: "/admin/projects",
    Component: () => <ProtectedRoute role="admin"><AdminManageProjects /></ProtectedRoute>,
  },
  {
    path: "/admin/projects/create",
    Component: () => <ProtectedRoute role="admin"><CreateProject /></ProtectedRoute>,
  },
  {
    path: "/admin/allocation",
    Component: () => <ProtectedRoute role="admin"><ManageAllocation /></ProtectedRoute>,
  },
  {
    path: "/admin/assessments",
    Component: () => <ProtectedRoute role="admin"><AdminAssessments /></ProtectedRoute>,
  },
  {
    path: "/admin/reports",
    Component: () => <ProtectedRoute role="admin"><Reports /></ProtectedRoute>,
  },
  {
    path: "/admin/discussions",
    Component: () => <ProtectedRoute role="admin"><AdminDiscussions /></ProtectedRoute>,
  },
  {
    path: "/admin/discussions/new",
    Component: () => <ProtectedRoute role="admin"><AdminNewDiscussion /></ProtectedRoute>,
  },
  {
    path: "/admin/forum",
    Component: () => <ProtectedRoute role="admin"><ManageForum /></ProtectedRoute>,
  },
  {
    path: "/admin/forum/new",
    Component: () => <ProtectedRoute role="admin"><NewForumPost /></ProtectedRoute>,
  },
  {
    path: "/admin/messages",
    Component: () => <ProtectedRoute role="admin"><AdminMessages /></ProtectedRoute>,
  },
  {
    path: "/admin/notifications",
    Component: () => <ProtectedRoute role="admin"><Notifications /></ProtectedRoute>,
  },
  {
    path: "/admin/profile",
    Component: () => <ProtectedRoute role="admin"><Profile /></ProtectedRoute>,
  },
]);

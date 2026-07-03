import { createBrowserRouter } from "react-router";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import ColorPalette from "./pages/ColorPalette";
import ForumThread from "./pages/ForumThread";
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
import Reports from "./pages/admin/Reports";
import ManageForum from "./pages/admin/ManageForum";
import NewForumPost from "./pages/admin/NewForumPost";
import AdminMessages from "./pages/admin/Messages";
import Notifications from "./pages/admin/Notifications";
import Profile from "./pages/admin/Profile";

export const router = createBrowserRouter([
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
    Component: StudentDashboard,
  },
  {
    path: "/student/projects",
    Component: BrowseProjects,
  },
  {
    path: "/student/assessments",
    Component: Assessments,
  },
  {
    path: "/student/feedback",
    Component: Feedback,
  },
  {
    path: "/student/discussions",
    Component: StudentDiscussions,
  },
  {
    path: "/student/discussions/new",
    Component: StudentNewDiscussion,
  },
  {
    path: "/student/discussions/:id",
    Component: StudentDiscussionThread,
  },
  {
    path: "/student/messages",
    Component: StudentMessages,
  },
  {
    path: "/student/notifications",
    Component: StudentNotifications,
  },
  {
    path: "/student/profile",
    Component: StudentProfile,
  },
  {
    path: "/supervisor/dashboard",
    Component: SupervisorDashboard,
  },
  {
    path: "/supervisor/projects",
    Component: ManageProjects,
  },
  {
    path: "/supervisor/assessments",
    Component: SupervisorAssessments,
  },
  {
    path: "/supervisor/assessments/grade/:id",
    Component: GradeSubmission,
  },
  {
    path: "/supervisor/feedback",
    Component: SupervisorFeedback,
  },
  {
    path: "/supervisor/discussions",
    Component: SupervisorDiscussions,
  },
  {
    path: "/supervisor/discussions/new",
    Component: SupervisorNewDiscussion,
  },
  {
    path: "/supervisor/discussions/:id",
    Component: SupervisorDiscussionThread,
  },
  {
    path: "/supervisor/messages",
    Component: SupervisorMessages,
  },
  {
    path: "/supervisor/notifications",
    Component: SupervisorNotifications,
  },
  {
    path: "/supervisor/profile",
    Component: SupervisorProfile,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
  {
    path: "/admin/users",
    Component: ManageUsers,
  },
  {
    path: "/admin/projects",
    Component: AdminManageProjects,
  },
  {
    path: "/admin/projects/create",
    Component: CreateProject,
  },
  {
    path: "/admin/allocation",
    Component: ManageAllocation,
  },
  {
    path: "/admin/reports",
    Component: Reports,
  },
  {
    path: "/admin/forum",
    Component: ManageForum,
  },
  {
    path: "/admin/forum/new",
    Component: NewForumPost,
  },
  {
    path: "/admin/messages",
    Component: AdminMessages,
  },
  {
    path: "/admin/notifications",
    Component: Notifications,
  },
  {
    path: "/admin/profile",
    Component: Profile,
  },
]);

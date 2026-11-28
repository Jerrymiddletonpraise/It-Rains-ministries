import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Spinner } from "@/components/ui/Misc";
import { RequireAuth } from "@/auth/RequireAuth";
import { SECTION_ACCESS, STAFF_ROLES } from "@/auth/roles";
import Home from "@/pages/Home";

const p = <T,>(f: () => Promise<{ default: T }>) => lazy(f as never);
const About = p(() => import("@/pages/About"));
const VisionMission = p(() => import("@/pages/VisionMission"));
const Beliefs = p(() => import("@/pages/Beliefs"));
const Leadership = p(() => import("@/pages/Leadership"));
const AboutPastor = p(() => import("@/pages/AboutPastor"));
const WatchLive = p(() => import("@/pages/WatchLive"));
const Sermons = p(() => import("@/pages/Sermons"));
const SermonDetail = p(() => import("@/pages/SermonDetail"));
const Podcasts = p(() => import("@/pages/Podcasts"));
const Ministries = p(() => import("@/pages/Ministries"));
const MinistryDetail = p(() => import("@/pages/MinistryDetail"));
const Events = p(() => import("@/pages/Events"));
const Resources = p(() => import("@/pages/Resources"));
const Devotionals = p(() => import("@/pages/Devotionals"));
const Prayer = p(() => import("@/pages/Prayer"));
const Testimonies = p(() => import("@/pages/Testimonies"));
const Give = p(() => import("@/pages/Give"));
const Membership = p(() => import("@/pages/Membership"));
const Visit = p(() => import("@/pages/Visit"));
const Volunteer = p(() => import("@/pages/Volunteer"));
const Contact = p(() => import("@/pages/Contact"));
const Faq = p(() => import("@/pages/Faq"));
const Privacy = lazy(() => import("@/pages/Legal").then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import("@/pages/Legal").then((m) => ({ default: m.Terms })));
const NotFound = p(() => import("@/pages/NotFound"));
const Login = p(() => import("@/pages/auth/Login"));
const Register = p(() => import("@/pages/auth/Register"));
const ForgotPassword = p(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = p(() => import("@/pages/auth/ResetPassword"));
const Dashboard = p(() => import("@/pages/portal/Dashboard"));
const ControlCenter = p(() => import("@/pages/admin/ControlCenter"));
const Overview = p(() => import("@/pages/admin/Overview"));
const SettingsEditor = p(() => import("@/pages/admin/SettingsEditor"));
const RolesManager = p(() => import("@/pages/admin/RolesManager"));
const AuditLog = p(() => import("@/pages/admin/AuditLog"));
const Planned = p(() => import("@/pages/admin/Planned"));
const Streaming = p(() => import("@/pages/admin/Streaming"));
const SermonsAdmin = p(() => import("@/pages/admin/SermonsAdmin"));
const PrayerAdmin = p(() => import("@/pages/admin/PrayerAdmin"));
const Inbox = p(() => import("@/pages/admin/Inbox"));
const EventsAdmin = p(() => import("@/pages/admin/EventsAdmin"));

export default function App() {
  return (
    <Suspense fallback={<div className="pt-32"><Spinner /></div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="vision-mission" element={<VisionMission />} />
          <Route path="beliefs" element={<Beliefs />} />
          <Route path="leadership" element={<Leadership />} />
          <Route path="about-the-pastor" element={<AboutPastor />} />
          <Route path="watch" element={<WatchLive />} />
          <Route path="sermons" element={<Sermons />} />
          <Route path="sermons/:slug" element={<SermonDetail />} />
          <Route path="podcasts" element={<Podcasts />} />
          <Route path="ministries" element={<Ministries />} />
          <Route path="ministries/:slug" element={<MinistryDetail />} />
          <Route path="events" element={<Events />} />
          <Route path="resources" element={<Resources />} />
          <Route path="devotionals" element={<Devotionals />} />
          <Route path="prayer" element={<Prayer />} />
          <Route path="testimonies" element={<Testimonies />} />
          <Route path="give" element={<Give />} />
          <Route path="membership" element={<Membership />} />
          <Route path="visit" element={<Visit />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="portal" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="control-center" element={<RequireAuth roles={STAFF_ROLES}><ControlCenter /></RequireAuth>}>
          <Route index element={<Overview />} />
          <Route path="settings" element={<RequireAuth roles={SECTION_ACCESS.settings}><SettingsEditor /></RequireAuth>} />
          <Route path="roles" element={<RequireAuth roles={SECTION_ACCESS.roles}><RolesManager /></RequireAuth>} />
          <Route path="audit" element={<RequireAuth roles={SECTION_ACCESS.audit}><AuditLog /></RequireAuth>} />
          <Route path="streaming" element={<RequireAuth roles={SECTION_ACCESS.streaming}><Streaming /></RequireAuth>} />
          <Route path="sermons" element={<RequireAuth roles={SECTION_ACCESS.sermons}><SermonsAdmin /></RequireAuth>} />
          <Route path="prayer" element={<RequireAuth roles={SECTION_ACCESS.prayer}><PrayerAdmin /></RequireAuth>} />
          <Route path="inbox" element={<RequireAuth roles={SECTION_ACCESS.inbox}><Inbox /></RequireAuth>} />
          <Route path="events" element={<RequireAuth roles={SECTION_ACCESS.events}><EventsAdmin /></RequireAuth>} />
          <Route path=":section" element={<Planned />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

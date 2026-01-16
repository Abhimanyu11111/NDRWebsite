import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import SeoRouteHandler from "./seo/SeoRouteHandler";
import "./App.css";

/* =========================
   ACCESSIBLE LOADER
========================= */
const Loader = () => (
  <div
    role="status"
    aria-live="polite"
    style={{ padding: "2rem", textAlign: "center" }}
  >
    Loading content, please wait…
  </div>
);

/* =========================
   LAZY LOADED PAGES
========================= */
const Home = lazy(() => import("./Pages/Home"));
const About = lazy(() => import("./Pages/About"));
const Objective = lazy(() => import("./Pages/Objective"));
const Contact = lazy(() => import("./Pages/Contact"));
const OperationalModel = lazy(() => import("./Pages/OperationalModel"));
const SalientFeatures = lazy(() => import("./Pages/SalientFeatures"));
const PoliciesPage = lazy(() => import("./Pages/PoliciesPage"));
const SedimentaryBasins = lazy(() => import("./Pages/SedimentaryBasins"));
const HelpPage = lazy(() => import("./Pages/HelpPage"));
const ResearchInvest = lazy(() => import("./Pages/ResearchInvest"));
const TechnologyBehindNDR = lazy(() => import("./Pages/TechnologyBehindNDR"));
const DownloadDataPriceListPolicies = lazy(() =>
  import("./Pages/DownloadDataPriceListPolicies")
);
const PaymentSuccess = lazy(() => import("./Pages/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./Pages/PaymentFailed"));
const Dashboard = lazy(() => import("./Pages/admin/Dashboard"));
const ManageBookings = lazy(() => import("./Pages/admin/ManageBookings"));
const BookVDR = lazy(() => import("./Pages/BookVDR"));
const RegistrationPage = lazy(() => import("./Pages/RegistrationPage"));
const CopyrightPolicy = lazy(() => import("./Pages/CopyrightPolicy"));
const Disclaimer = lazy(() => import("./Pages/Disclaimer"));
const ComapPolicy = lazy(() => import("./Pages/ComapPolicy"));
const ContentReviewPolicy = lazy(() => import("./Pages/ContentReviewPolicy"));
const ContentArchivalPolicy = lazy(() => import("./Pages/ContentArchivalPolicy"));
const ContingencyManagementPlan = lazy(() =>
  import("./Pages/ContingencyManagementPlan")
);
const WebsiteMonitoringPolicy = lazy(() =>
  import("./Pages/WebsiteMonitoringPolicy")
);
const SecurityPolicy = lazy(() => import("./Pages/SecurityPolicy"));
const HyperlinkingPolicy = lazy(() => import("./Pages/HyperlinkingPolicy"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./Pages/TermsConditions"));
const WebsitePolicies = lazy(() => import("./Pages/WebsitePolicies"));
const Archives = lazy(() => import("./Pages/Archives"));
const NewSeismicData = lazy(() => import("./Pages/NewSeismicData"));
const RevisedDataSubmission = lazy(() =>
  import("./Pages/RevisedDataSubmission")
);
const New2DSeismicData = lazy(() => import("./Pages/New2DSeismicData"));
const IndiaStatsMap = lazy(() => import("./Pages/SeismicAndWellData"));
const NotFound = lazy(() => import("./Pages/NotFound"));

// ⭐ Admin Login page (normal import)
import LoginAdmin from "./Pages/admin/LoginAdmin";
// ⭐ Admin Route Guard
import AdminRoute from "./utils/AdminRoute";

/* =========================
   APP
========================= */
export default function App() {
  return (
    <>
      {/* SEO HANDLER */}
      <SeoRouteHandler />

      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/objective" element={<Objective />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/operationalModel" element={<OperationalModel />} />
          <Route path="/salientFeatures" element={<SalientFeatures />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/sedimentaryBasins" element={<SedimentaryBasins />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/researchInvest" element={<ResearchInvest />} />
          <Route path="/technologybehindNDR" element={<TechnologyBehindNDR />} />
          <Route path="/DownloadDataPriceListPolicies" element={<DownloadDataPriceListPolicies />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/copyrightPolicy" element={<CopyrightPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/comapPolicy" element={<ComapPolicy />} />
          <Route path="/contentReviewPolicy" element={<ContentReviewPolicy />} />
          <Route path="/contentArchivalPolicy" element={<ContentArchivalPolicy />} />
          <Route path="/contingencyManagementPlan" element={<ContingencyManagementPlan />} />
          <Route path="/websiteMonitoringPolicy" element={<WebsiteMonitoringPolicy />} />
          <Route path="/securityPolicy" element={<SecurityPolicy />} />
          <Route path="/hyperlinkingPolicy" element={<HyperlinkingPolicy />} />
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/termsConditions" element={<TermsConditions />} />
          <Route path="/websitePolicies" element={<WebsitePolicies />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/newSeismicData" element={<NewSeismicData />} />
          <Route path="/revisedDataSubmission" element={<RevisedDataSubmission />} />
          <Route path="/new2DSeismicData" element={<New2DSeismicData />} />
          <Route path="/SeismicAndWellData" element={<IndiaStatsMap />} />
          <Route path="/paymentsuccess" element={<PaymentSuccess />} />
          <Route path="/paymentfailed" element={<PaymentFailed />} />
          <Route path="/book-vdr" element={<BookVDR />} />

          {/* ⭐⭐ ADMIN ROUTES START ⭐⭐ */}
          <Route path="/admin/login" element={<LoginAdmin />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/managebookings"
            element={
              <AdminRoute>
                <ManageBookings />
              </AdminRoute>
            }
          />
          {/* ⭐⭐ ADMIN ROUTES END ⭐⭐ */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

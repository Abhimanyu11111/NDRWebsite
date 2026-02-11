import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import SeoRouteHandler from "./seo/SeoRouteHandler";
import "./App.css";

/* =========================
   ACCESSIBLE LOADER
========================= */
const Loader = () => (
  <div role="status" aria-live="polite" style={{ padding: "2rem", textAlign: "center" }}>
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
const BookingDetails = lazy(() => import("./Pages/admin/BookingDetails"));
const ManageData = lazy(() => import("./Pages/admin/ManageData"));
const ManageUsers = lazy(() =>import("./Pages/admin/ManageUsers"));
const BookVDR = lazy(() => import("./Pages/BookVDR"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const RegistrationPage = lazy(() => import("./Pages/RegistrationPage"));
const CopyrightPolicy = lazy(() => import("./Pages/CopyrightPolicy"));
const Disclaimer = lazy(() => import("./Pages/Disclaimer"));
const ComapPolicy = lazy(() => import("./Pages/ComapPolicy"));
const ContentReviewPolicy = lazy(() => import("./Pages/ContentReviewPolicy"));
const ContentArchivalPolicy = lazy(() => import("./Pages/ContentArchivalPolicy"));
const ContingencyManagementPlan = lazy(() =>
  import("./Pages/ContingencyManagementPlan")
);
const WebsiteMonitoringPolicy = lazy(() => import("./Pages/WebsiteMonitoringPolicy"));
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

// Normal imports (not lazy)
import LoginAdmin from "./Pages/admin/LoginAdmin";
import AdminRoute from "./utils/AdminRoute";

/* =========================
   APP
========================= */
export default function App() {
  return (
    <>
      <SeoRouteHandler />

      <Suspense fallback={<Loader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
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
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />

          {/* ADMIN LOGIN (PUBLIC) */}
          <Route path="/admin/login" element={<LoginAdmin />} />
          

          {/* PROTECTED ADMIN ROUTES */}
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

          <Route
            path="/admin/bookingdetails/:id"
            element={
              <AdminRoute>
                <BookingDetails />
              </AdminRoute>
            }
          />

          <Route
           path="/admin/managedata"
           element={
            <AdminRoute>
              <ManageData />
            </AdminRoute>
           }
           
           />

           <Route
           path="/admin/manageusers"
           element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
           }
           
           />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

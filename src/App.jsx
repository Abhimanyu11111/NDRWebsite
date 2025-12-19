import React from 'react'
import { Routes, Route } from "react-router-dom";
import Home from './Pages/Home'
import About from "./Pages/About";
import Objective from "./Pages/Objective"
import Contact from './Pages/Contact';
import OperationalModel from './Pages/OperationalModel';
import SalientFeatures from './Pages/SalientFeatures';
import PoliciesPage from './Pages/PoliciesPage';
import SedimentaryBasins from './Pages/SedimentaryBasins';
import HelpPage from './Pages/HelpPage';
import ResearchInvest from './Pages/ResearchInvest';
import TechnologyBehindNDR from './Pages/TechnologyBehindNDR';
import DownloadDataPriceListPolicies from './Pages/DownloadDataPriceListPolicies';
import RegistrationPage from './Pages/RegistrationPage';
import CopyrightPolicy from './Pages/CopyrightPolicy';
import Disclaimer from './Pages/Disclaimer';
import ComapPolicy from './Pages/ComapPolicy';
import ContentReviewPolicy from './Pages/ContentReviewPolicy';
import ContentArchivalPolicy from './Pages/ContentArchivalPolicy';
import ContingencyManagementPlan from './Pages/ContingencyManagementPlan';
import WebsiteMonitoringPolicy from './Pages/WebsiteMonitoringPolicy';
import SecurityPolicy from './Pages/SecurityPolicy';
import HyperlinkingPolicy from './Pages/HyperlinkingPolicy';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsConditions from './Pages/TermsConditions';
import WebsitePolicies from './Pages/WebsitePolicies';
import Archives from './Pages/Archives';
import NewSeismicData from './Pages/NewSeismicData';
import RevisedDataSubmission from './Pages/RevisedDataSubmission';
import New2DSeismicData from './Pages/New2DSeismicData';
import IndiaStatsMap from './Pages/SeismicAndWellData';
import './App.css'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/objective" element={<Objective />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/operationalModel" element={<OperationalModel />} />
        <Route path="/salientFeatures" element={<SalientFeatures />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/sedimentaryBasins" element={<SedimentaryBasins />} />
        <Route path ="/help" element={<HelpPage />} />
        <Route path ="/researchInvest" element={<ResearchInvest />} />
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


      </Routes>
    </>
  )
}

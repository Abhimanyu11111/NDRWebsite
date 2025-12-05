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
      </Routes>
    </>
  )
}

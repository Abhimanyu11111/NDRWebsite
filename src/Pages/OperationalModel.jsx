import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../Component/Styles/Operational.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const OperationalModel = () => {
  const points = [
    "NDR contract has been awarded on turnkey basis to build, populate & operate.",
    "All the E&P data pertaining to India’s E&P regimes including Nomination regime, Pre-NELP regime and NELP regime have been populated into the NDR database in a phased manner. E&P data acquired under various government programs are also being updated in NDR database on perpetual basis.",
    "Available data-sets can be viewed from anywhere after sign up on GIS based NDR portal.",
    "Provision for online data selection and ordering is available through NDR portal."
  ];

  return (
    <>
      <HeaderWrapper />

      <div className="operational-wrapper">
        <div className="operational-container">

          <h1 className="operational-title">Operational Model of NDR</h1>

          <ul className="operational-list">
            {points.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default OperationalModel;

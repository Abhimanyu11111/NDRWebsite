import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../Component/Styles/Salient.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const SalientFeatures = () => {
  const points = [
    "Wholly funded by Govt. of India.",
    "Availability of high quality and reliable E&P data (seismic & well logs) in online, near-line, offline modes.",
    "Independent secured web based access.",
    // "State of the art Primary Data Centre (PDC) equipped with latest technology and data storage capacity of 200 TB to store processed data & 720TB robotic tape library to store raw data.",
    // "NDR-Secondary data centre (SDC) setup in Bhubaneswar with a storage facility of 140TB as a Disaster Recovery and Business Continuity Centre.",
    "Real time data synchronisation and replication between PDC & SDC.",
    "Common window for all concerned stakeholders in E&P domain including industries, government, research agencies etc. for online data viewing, selecting & ordering.",
    "24×7 online display of available 2D/3D/well data, PEL/ML areas, NELP/OALP/CBM blocks, active blocks, No-Go areas, open acreage areas, forest and other cultural boundaries on GIS based portal.",
    "To support open acreages policy.",
    "Online portal (Team Work Space-TWS) showcasing E&P data of 26 Indian Sedimentary Basins along with capability for online data viewing, selecting and ordering on 24×7 basis.",
    "Continuous update of open acreages for helping E&P operators to choose and submit Expression of Interest (EOI).",
    "Dedicated data storage rooms for media and reports with latest security features.",
    "Fully equipped G&G Data Visualisation & Interpretation Room for quick-look evaluation of blocks/acreages."
  ];

  return (
    <>
      <HeaderWrapper />

      <div className="salient-wrapper">
        <div className="salient-container">
          <h1 className="salient-title">Salient features of NDR</h1>

          <ul className="salient-list">
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

export default SalientFeatures;

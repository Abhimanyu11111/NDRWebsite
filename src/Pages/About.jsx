import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import HeaderWrapper from "../Component/HeaderWrapper";


import { FaDatabase, FaOilCan, FaMapMarkedAlt, FaBook, FaCubes } from "react-icons/fa";
import "../Component/Styles/About.css";

const About = () => {
    const cards = [
        { icon: <FaDatabase />, title: "Seismic Data" },
        { icon: <FaOilCan />, title: "Well & Log Data" },
        { icon: <FaMapMarkedAlt />, title: "Spatial Data" },
        { icon: <FaCubes />, title: "G&G Data (Drilling, Reservoir, Production etc.)" },
        { icon: <FaBook />, title: "Reports & Documents" },
    ];

    return (
        <>
            {/* <Header /> */}
            <HeaderWrapper />

            <div className="about-wrapper">
                <div className="about-container">
                    <h1>National Data Repository (NDR)</h1>

                    <p>
                        National Data Repository (NDR) is a government-sponsored E&P data bank with
                        state-of-the-art facilities for preservation, upkeep and dissemination of data
                        to enable its systematic use for future exploration and development. Operational
                        since 28th July 2017, NDR functions on a turnkey model of Build, Populate and Operate.
                    </p>

                    <h3 className="section-title">Types of Data Stored in NDR</h3>

                    {/* NEW 3–2 CARD LAYOUT */}
                    <div className="card-row">
                        {/* Top 3 cards */}
                        <div className="card-grid top-row">
                            {cards.slice(0, 3).map((item, index) => (
                                <div className="card" key={index}>
                                    <div className="icon">{item.icon}</div>
                                    <p>{item.title}</p>
                                </div>
                            ))}
                        </div>

                        {/* Bottom 2 cards */}
                        <div className="card-grid bottom-row">
                            {cards.slice(3, 5).map((item, index) => (
                                <div className="card" key={index}>
                                    <div className="icon">{item.icon}</div>
                                    <p>{item.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p>
                        NDR safeguards national E&P data assets by promoting exploration and production
                        activities in India. It has streamlined associated procedures, policies and workflows
                        relating to data submission, cataloguing, viewing, retrieval and trading for all
                        stakeholders including industries, government agencies, academia and research communities.
                    </p>

                    <p>
                        It stores and maintains hydrocarbon exploration and production data in a safe and
                        reusable manner for long-term use. The data is preserved as per accepted NDR standards
                        and made available to entitled users.
                    </p>

                    <p>
                        NDR has significantly enhanced India’s petroleum exploration prospects and supported
                        Bidding Rounds by increasing the availability of quality data. This places India
                        among the nations with a modern NDR capable of competing globally in the E&P sector.
                    </p>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default About;

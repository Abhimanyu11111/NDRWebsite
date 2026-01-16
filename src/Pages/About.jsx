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
                        National Data Repository (NDR) is a cloud-based national E&P data platform established by the Government of India and operated under the aegis of the Directorate General of Hydrocarbons (DGH) for the systematic preservation, management, and dissemination of India's upstream oil and gas data. The platform represents the modernisation of India's national data infrastructure into a scalable, secure, and resilient cloud-enabled ecosystem aligned with national data policies and global best practices.
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

                    <p>NDR hosts exploration and production data acquired over several decades by public and private operators, constituting a strategic national asset owned by the Government of India. The repository enables centralised data assimilation, standardised metadata management, governed access, and digital delivery of seismic, well, geological, geophysical, drilling, production, and related E&P data, along with associated reports and documents.
                    </p>

                    <p>
                        Built on cloud infrastructure, NDR provides high availability, disaster recovery, enhanced cybersecurity, and elastic scalability to support licensing rounds, regulatory oversight, and long-term data stewardship. It serves as the single, authoritative source of trusted E&P data for government, industry, academia, and research institutions, supporting informed decision-making across the hydrocarbon value chain.
                    </p>

                    {/* <p>
                        NDR has significantly enhanced India’s petroleum exploration prospects and supported
                        Bidding Rounds by increasing the availability of quality data. This places India
                        among the nations with a modern NDR capable of competing globally in the E&P sector.
                    </p> */}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default About;

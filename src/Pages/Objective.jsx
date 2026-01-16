import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import HeaderWrapper from "../Component/HeaderWrapper";


import { FaCheckCircle } from "react-icons/fa";
import "../Component/Styles/Objective.css";

const Objective = () => {
    const points = [
        "To preserve national E&P data assets in a standardised, secure, and reusable form with long-term integrity and availability",
        "To improve data quality, metadata consistency, and discoverability through defined standards and governed workflows",
        "To enable efficient data submission, validation, cataloguing, access, and dissemination for authorised users",
        "To strengthen DGH's capability for regulatory monitoring, reporting, and oversight of E&P activities",
        "To support licensing rounds and investment decisions by providing timely access to high-quality, trusted data",
        "To facilitate data sharing in accordance with Government of India policies",
        "To leverage cloud infrastructure for scalability, resilience, cybersecurity, and operational efficiency",
        "To enable advanced data analytics and visualisation by industry and research communities",
    ];

    return (
        <>
            <HeaderWrapper />

            <div className="container">
                <div className="objective-wrapper">
                    <div className="objective-container">
                        <h1>Objective / Goals of National Data Repository (NDR)</h1>

                        <p className="intro-text">
                            The primary objective of NDR is to establish a secure, reliable, and cloud-enabled national repository for India's exploration and production data, ensuring seamless access and efficient online data management. The specific objectives are:
                        </p>

                        <ul className="objective-list">
                            {points.map((item, index) => (
                                <li key={index}>
                                    <FaCheckCircle className="list-icon" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                    </div>
                </div>
            </div>



            <Footer />
        </>
    );
};

export default Objective;

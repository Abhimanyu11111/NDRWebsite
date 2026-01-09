import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import HeaderWrapper from "../Component/HeaderWrapper";


import { FaCheckCircle } from "react-icons/fa";
import "../Component/Styles/Objective.css";

const Objective = () => {
    const points = [
        "To validate, store, maintain and reproduce high quality and reliable Geo-scientific data",
        "To facilitate efficient data reporting, data exchange, and data trading between DGH and existing players including all Geo-scientific agencies and academia",
        "To improve DGH’s ability to monitor and control the E&P activities and reporting",
        "To encourage new E & P activities by providing high quality and reliable data",
        "To strengthen overall Geo-scientific activities in India",
        "To support an open acreage system for an improved Global E & P Business environment in India",
        "To provide quality E & P data for Processing, Interpretation and Visualisation Centres at DGH",
    ];

    return (
        <>
            <HeaderWrapper />

            <div className="container">
                <div className="objective-wrapper">
                    <div className="objective-container">
                        <h1>Objective / Goals of National Data Repository (NDR)</h1>

                        <p className="intro-text">
                            The main objective is to setup National Data Repository of reliable exploration and production data
                            for India with provisions for seamless access and online data management. Specific goals are:
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

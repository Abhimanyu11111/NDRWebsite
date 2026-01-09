import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Styles/Footer.module.css";
import emblem from "../assets/images/emblem1.png";
import { FaXTwitter, FaLinkedin } from "react-icons/fa6";
import DateAndTime from "./DateAndTime";
import hl from "../assets/images/hl.png";

export default function Footer() {
    const [visitor, setVisitor] = useState(0);

    // Update visitor counter in DB + get total
    useEffect(() => {
        fetch("http://localhost:5000/api/visitor/increment", {
            method: "POST",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setVisitor(data.total);
                }
            })
            .catch((err) => console.log(err));
    }, []);

    // Log visitor info (IP, Location, Browser, Device)
    useEffect(() => {
        fetch("http://localhost:5000/api/visitor/log", {
            method: "POST",
        }).catch((err) => console.log(err));
    }, []);

    return (
        <>
            <footer className={styles.footer}>
                <div className={styles.container}>

                    {/* LEFT SECTION */}
                    <div className={styles.left}>
                        <div className={styles.headingBlock}>
                            <div className={styles.logoboxfooter}>
                                <img style={{ width: "100%" }} src={emblem} alt="Emblem" />
                            </div>

                            <div>
                                <h2 className={styles.title}>National Data Repository</h2>
                                <div className={styles.subtitle}>
                                    Directorate General of Hydrocarbons (DGH)
                                </div>
                                <p className={styles.ministry}>
                                    Ministry of Petroleum and Natural Gas, Government of India
                                </p>
                            </div>
                        </div>

                        <p className={styles.desc}>
                            NDR is a comprehensive, government-managed E&P data repository that
                            centralizes seismic, well, production, reservoir, and GIS information.
                            It enables investors, researchers, E&P companies, and academic
                            institutions to access authenticated, high-quality data for India’s
                            hydrocarbon exploration.
                        </p>

                        <div className={styles.visitorBox}>
                            <span className={styles.visitorLabel}>Visitor No:</span>
                            <span className={styles.visitorCount}>
                                {visitor.toString().padStart(8, "0")}
                            </span>
                            <DateAndTime />
                        </div>
                    </div>

                    {/* MIDDLE SECTION */}
                    <div className={styles.middle}>

                        {/* USEFUL LINKS */}
                        <div>
                            <h3 className={styles.colTitle}>Useful links</h3>
                            <ul className={styles.linkList}>
                                <li><Link to="/about">About NDR</Link></li>
                                <li><Link to="/help">Help & support</Link></li>
                                <li><Link to="/archives">Archives</Link></li>
                                <li><Link to="/faq">Photo Gallery</Link></li>
                            </ul>

                            <div className={styles.social}>
                                <span>Social</span>
                                <div className={styles.icons}>
                                    <a
                                        className={styles.medialinks}
                                        style={{ fontSize: "1.8rem" }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://x.com/DghIndia"
                                    >
                                        <FaXTwitter className={styles.icon} />
                                    </a>

                                    <a
                                        className={styles.medialinks}
                                        style={{ fontSize: "1.8rem" }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://www.linkedin.com/in/dgh-india-826855120"
                                    >
                                        <FaLinkedin className={styles.icon} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* LEGAL LINKS */}
                        <div>
                            <h3 className={styles.colTitle}>Legal</h3>
                            <ul className={styles.linkList}>
                                <li><Link to="/websitePolicies">Website Policies</Link></li>
                                <li><Link to="/disclaimer">Disclaimer</Link></li>
                                <li><Link to="/comapPolicy">Copyright</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className={styles.right}>
                        <h3 className={styles.colTitle}>Address:</h3>
                        <p className={styles.addr}>
                            Directorate General of Hydrocarbons (DGH)<br />
                            National Data Repository (NDR)<br />
                            OIDB Bhawan, Tower B, Plot No. 2<br />
                            Sector - 73, Noida, Uttar Pradesh – 201301<br />
                            Phone: +91-120-2472000<br />
                            Email: ndr@dgh.gov.in
                        </p>

                        <div className={styles.hauliLogoBox}>
                            <img className={styles.hauliLogo} src={hl} alt="Halliburton Logo" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* COPYRIGHT BAR */}
            <div className={styles.copyBar}>
                <div className="container">
                    <div className={styles.copy}>
                        © Directorate General of Hydrocarbons – Government of India
                    </div>
                </div>
            </div>
        </>
    );
}

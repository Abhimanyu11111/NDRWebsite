import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/WebsitePolicies.module.css";
import { Link } from "react-router-dom";
import HeaderWrapper from "../Component/HeaderWrapper";


const WebsitePolicies = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Website Policies</h2>

          <ul className={styles.list}>
            <li>
              <Link to="/copyrightPolicy">Copyright Policy</Link>
            </li>
            <li>
              <Link to="/disclaimer">Disclaimer</Link>
            </li>
            <li>
              <Link to="/comapPolicy">
                Content Ownership, Moderation &amp; Approval Policy
              </Link>
            </li>
            <li>
              <Link to="/contentReviewPolicy">
                Content Monitoring and Review Policy
              </Link>
            </li>
            <li>
              <Link to="/contentarchivalpolicy">
                Content Archival Policy (CAP)
              </Link>
            </li>
            <li>
              <Link to="/contingencyManagementPlan">
                Contingency Management Plan
              </Link>
            </li>
            <li>
              <Link to="/websiteMonitoringPolicy">
                Website Monitoring Policy
              </Link>
            </li>
            <li>
              <Link to="/securityPolicy">Security Policy</Link>
            </li>
            <li>
              <Link to="/hyperlinkingPolicy">Hyperlinking Policy</Link>
            </li>
            <li>
              <Link to="/privacypolicy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/termsconditions">Terms &amp; Conditions</Link>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default WebsitePolicies;

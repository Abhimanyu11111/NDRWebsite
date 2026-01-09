import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/WebsiteMonitoringPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const WebsiteMonitoringPolicy = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Website Monitoring Policy</h2>

          <p className={styles.text}>
            NDR has a Website Monitoring Policy in place and the website is
            monitored periodically to address and fix the quality and
            compatibility issues around the following parameters:
          </p>

          <ul className={styles.list}>
            <li>
              <strong>Performance:</strong> Site download time is optimised for
              a variety of network connections as well as devices. All important
              pages of the website are tested for this.
            </li>

            <li>
              <strong>Functionality:</strong> All modules of the website are
              tested for their functionality. The interactive components of the
              site such as feedback forms are working smoothly.
            </li>

            <li>
              <strong>Broken Links:</strong> The website is thoroughly reviewed
              to rule out the presence of any broken links or errors.
            </li>

            <li>
              <strong>Traffic Analysis:</strong> The site traffic is regularly
              monitored to analyse the usage patterns.
            </li>

            <li>
              <strong>Feedback:</strong> Feedback from the visitors is the best
              way to judge a website’s performance and make necessary
              improvements. A proper mechanism for feedback is in place to
              carry out the changes and enhancements as suggested by the
              visitors.
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default WebsiteMonitoringPolicy;

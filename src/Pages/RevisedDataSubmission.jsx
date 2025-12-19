import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/NewSeismicData.module.css";

const RevisedDataSubmission = () => {
  return (
    <>
      <Header />

      <main className={styles.pageWrapper}>
        <div className={styles.page}>

          {/* Title */}
          <h1 className={styles.title}>
            Revised &amp; updated data submission guideline is uploaded and can
            be downloaded through download section.
          </h1>

          {/* Description */}
          <p className={styles.description}>
            Revised &amp; updated data submission guideline is uploaded and can
            be downloaded through{" "}
            <a
              href="/DownloadDataPriceListPolicies"
              className={styles.link}
            >
              Revised Data Submission Guidelines
            </a>
            .
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default RevisedDataSubmission;

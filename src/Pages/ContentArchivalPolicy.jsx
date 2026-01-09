import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/ContentArchivalPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";

const ContentArchivalPolicy = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Content Archival Policy (CAP)</h2>

          <p className={styles.text}>
            The content components are created with metadata, source and
            validity date. Validity of some of the components may not be known
            at the time of creation. Such content is treated as perpetual and
            the validity date shall be ten years from the date of creation.
            The content shall not be displayed on the Website after the
            validity date.
          </p>

          <p className={styles.text}>
            Some of the short lived content components like tenders,
            resolutions, draft for discussion etc. which will not have any
            relevance on the website after the event or intended purpose.
            The content components like documents, reports, may be archived
            based on the merit of the document concerned as decided by the
            website team of NDR.
          </p>

          <p className={styles.text}>
            The content is normally reviewed at least two weeks prior to the
            validity date and if required re-validate the content and modify
            the validity date. If content is not relevant, then the content is
            archived and no longer published on the Website.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContentArchivalPolicy;

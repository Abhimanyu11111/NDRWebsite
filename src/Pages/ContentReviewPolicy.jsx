import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/ContentReviewPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const ContentReviewPolicy = () => {
  return (
    <>
      <HeaderWrapper />
      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>
            Content Monitoring and Review Policy
          </h2>

          <p className={styles.text}>
            All possible efforts need to be taken to keep the content on the
            Website current and up-to-date. This Content Review Policy defines
            the roles and responsibilities of the website content review and
            the manner in which it need to be carried out. Review Policies are
            defined for the diverse content elements.
          </p>

          <p className={styles.text}>
            The Review Policy is based on different type of content elements,
            its validity and relevance as well as the archival policy.
          </p>

          <p className={styles.text}>
            Given below the essential Content Review Policy for NDR’s website:
          </p>

          <ul className={styles.list}>
            <li>
              The entire website content would be reviewed for syntax checks
              once in quarter by the NDR’s website team.
            </li>
            <li>
              Data pertaining to major events like NELP etc. would be updated
              as and when such event takes place.
            </li>
            <li>
              Validity date, license date etc. for various E&amp;P
              blocks/areas would be reviewed once half yearly.
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContentReviewPolicy;

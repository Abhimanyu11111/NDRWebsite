import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/Disclaimer.module.css";

const Disclaimer = () => {
  return (
    <>
      <Header />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Disclaimer</h2>

          <p className={styles.text}>
            The use of this website amounts to accepting all the terms of this
            disclaimer notice. While every effort is made to ensure that the
            content of this website is accurate, DGH makes no representations
            or warranties in relation to the accuracy or completeness of the
            information provided on the website. While the content of this site
            is provided in good faith, we do not warrant that the information
            will be kept up to date, be true and not misleading.
          </p>

          <p className={styles.text}>
            This data provided on the web site is subject to quality check.
            The data available after the quality check will be notified on the
            site. For any clarification/ authenticity of data the concern group
            of DGH may be contacted at{" "}
            <a
              href="mailto:indr@dghindia.gov.in"
              className={styles.link}
            >
              indr@dghindia.gov.in
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Disclaimer;

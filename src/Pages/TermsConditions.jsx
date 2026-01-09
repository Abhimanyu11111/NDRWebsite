import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/TermsConditions.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const TermsConditions = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Terms &amp; Conditions</h2>

          <p className={styles.text}>
            Website Developed and Maintained – M/s Halliburton Offshore Services
            Inc through 3rd party vendor.
          </p>

          <p className={styles.text}>
            Hosted by – <strong>National Data Repository (NDR), DGH</strong>
          </p>

          <p className={styles.text}>
            Contents &amp; Design provided by –{" "}
            <strong>National Data Repository (NDR), DGH</strong>
          </p>

          <p className={styles.text}>
            Though all efforts have been made to ensure the accuracy and
            currency of the content on this website, the same should not be
            construed as a statement of law or used for any legal purposes. In
            case of any ambiguity or doubts, users are advised to
            verify/check with the NDR, Directorate General of Hydrocarbons
            (DGH) and/or other source(s), and to obtain appropriate professional
            advice.
          </p>

          <p className={styles.text}>
            Under no circumstances will NDR, DGH be liable for any expense,
            loss or damage including, without limitation, indirect or
            consequential loss or damage, or any expense, loss or damage
            whatsoever arising from use, or loss of use, of data, arising out
            of or in connection with the use of this website.
          </p>

          <p className={styles.text}>
            These terms and conditions shall be governed by and construed in
            accordance with the Indian Laws. Any dispute arising under these
            terms and conditions shall be subject to the jurisdiction of the
            courts of India.
          </p>

          <p className={styles.text}>
            The information posted on this website could include hypertext
            links or pointers to information created and maintained by
            non-Government/private organisations. NDR is providing these links
            and pointers solely for your information and convenience.
          </p>

          <p className={styles.text}>
            When you select a link to an external website, you are leaving the
            NDR website and are subject to the privacy and security policies of
            the owners/sponsors of the external website. NDR does not guarantee
            the availability of such linked pages at all times.
          </p>

          <p className={styles.text}>
            NDR cannot authorise the use of copyrighted materials contained in
            a linked website. Users are advised to request such authorisation
            from the owner of the linked website. National Data Repository
            (NDR) does not guarantee that linked websites comply with Indian
            Government Web Guidelines.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TermsConditions;

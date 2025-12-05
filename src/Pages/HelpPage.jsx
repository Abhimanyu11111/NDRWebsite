// src/Pages/HelpPage.jsx
import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/help.module.css";

const HelpPage = () => {
  return (
    <>
      <Header />

      <main className={styles.helpWrapper}>
        <div className="container">
          <section className={styles.helpContainer}>
            <h1 className={styles.pageTitle}>Help & User Guide</h1>
            <p className={styles.pageIntro}>
              This guide will walk you through the key steps to use the
              National Data Repository (NDR) portal – from registration to
              login, password reset, academic registration and contact details.
            </p>

            {/* STEP 1 – REGISTRATION */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>1</span>
                <h2 className={styles.stepTitle}>Registration</h2>
              </div>
              <div className={styles.stepBody}>
                <p>
                  National Data Repository (NDR) is a government-sponsored E&amp;P
                  data bank for preservation, upkeep and dissemination of data
                  for exploration and development.
                </p>
                <ul className={styles.stepList}>
                  <li>
                    Users are requested to register themselves on the NDR
                    portal to gain access to data.
                  </li>
                  <li>
                    Registration is accepted <strong>only with official email IDs</strong>.
                    Free / personal emails (Gmail, Yahoo, Outlook etc.) are not
                    accepted.
                  </li>
                  <li>
                    Go to the NDR portal and click on the{" "}
                    <strong>“Register”</strong> button on the data tab.
                  </li>
                  <li>
                    Fill in all mandatory fields (marked with <strong>*</strong>),
                    including organisation details, contact details and other
                    required information.
                  </li>
                  <li>
                    Submit the registration form and wait for verification.
                    Please allow <strong>24 working hours</strong> for processing during
                    office hours (Mon–Fri, 9:30 AM to 5:30 PM IST; excluding
                    public holidays).
                  </li>
                  <li>
                    After successful submission, a system generated email will
                    confirm that your registration request has been received.
                  </li>
                </ul>
              </div>
            </div>

            {/* STEP 2 – LOGIN */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>2</span>
                <h2 className={styles.stepTitle}>Login</h2>
              </div>
              <div className={styles.stepBody}>
                <ul className={styles.stepList}>
                  <li>
                    Once your registration is validated, you will receive{" "}
                    <strong>login credentials</strong> for the NDR portal.
                  </li>
                  <li>
                    Open the NDR portal and go to the{" "}
                    <strong>“Login”</strong> tab in the top menu.
                  </li>
                  <li>
                    Enter your registered email ID and password to access the
                    data and tools available on the portal.
                  </li>
                  <li>
                    After login, you can follow the help guidelines available
                    inside the NDR portal to explore datasets and features.
                  </li>
                </ul>
              </div>
            </div>

            {/* STEP 3 – FORGOT / RESET PASSWORD */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>3</span>
                <h2 className={styles.stepTitle}>Forgot / Reset Password</h2>
              </div>
              <div className={styles.stepBody}>
                <ul className={styles.stepList}>
                  <li>
                    If you forget your password, go to the{" "}
                    <strong>“Login”</strong> tab and click{" "}
                    <strong>“Forgot / Reset Password”</strong>.
                  </li>
                  <li>
                    Enter your registered email address and the captcha code.
                  </li>
                  <li>
                    Submit the form to send a reset password request. Follow
                    the instructions received on your email to set a new
                    password.
                  </li>
                </ul>
              </div>
            </div>

            {/* STEP 4 – ACADEMIC REGISTRATION GUIDELINES */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>4</span>
                <h2 className={styles.stepTitle}>Academic Registration Guidelines</h2>
              </div>
              <div className={styles.stepBody}>
                <p>
                  Academic users must submit additional documents for their
                  registration request to be processed.
                </p>
                <ul className={styles.stepList}>
                  <li>
                    Send a <strong>scanned copy of your Student ID card</strong>.
                  </li>
                  <li>
                    Send an <strong>authority letter</strong> on official letterhead
                    from a competent authority (HOD, VC, etc.) with seal/stamp
                    confirming legitimate use.
                  </li>
                  <li>
                    Email these documents to{" "}
                    <strong>indr@dghindia.gov.in</strong> (use the official
                    format as per guidelines).
                  </li>
                  <li>
                    Registration processing for academic accounts starts only
                    after receiving the above documents.
                  </li>
                </ul>

                <p className={styles.noteTitle}>Important instructions:</p>
                <ul className={styles.stepList}>
                  <li>Only colour scanned copies of original documents are accepted.</li>
                  <li>Student ID card file size should be less than 100 KB.</li>
                  <li>Authority letter file size should be less than 500 KB.</li>
                </ul>
              </div>
            </div>

            {/* STEP 5 – CONTACT DETAILS */}
            <div className={styles.step}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>5</span>
                <h2 className={styles.stepTitle}>Contact Us</h2>
              </div>
              <div className={styles.stepBody}>
                <p>
                  For any queries or assistance regarding the NDR portal,
                  you can reach out using the following details:
                </p>

                <div className={styles.contactGrid}>
                  <div>
                    <h3>Address</h3>
                    <p>
                      National Data Repository, Directorate General of
                      Hydrocarbons (DGH) <br />
                      Ministry of Petroleum and Natural Gas, Government of India
                      <br />
                      OIDB Bhawan, Plot No 2, Sector-73, Noida (UP), India-201301
                    </p>
                  </div>
                  <div>
                    <h3>Email</h3>
                    <p>indr@dghindia.gov.in</p>

                    <h3>Phone</h3>
                    <p>
                      +91-120-2472578 (HoD-NDR / Chief NDR) <br />
                      +91-120-2472551 (NDR Technical Support) <br />
                      +91-120-2472000 (DGH Reception)
                    </p>

                    <h3>Working Hours</h3>
                    <p>
                      Monday to Friday – 9:30 AM to 5:30 PM (UTC+05:30),
                      except public holidays.
                    </p>
                  </div>
                </div>

                <p className={styles.footerNote}>
                  You can also view the yearly holiday calendar from the NDR
                  portal for more information.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HelpPage;

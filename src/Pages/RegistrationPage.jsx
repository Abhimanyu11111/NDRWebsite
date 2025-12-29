import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import HeaderWrapper from "../Component/HeaderWrapper";
import styles from "../Component/Styles/Registration.module.css";

const RegistrationPage = () => {
  return (
    <>
      <HeaderWrapper />

      <div className={styles.page}>
        <h2 className={styles.mainTitle}>Registration Form</h2>
        <p className={styles.subtitle}>
          To register as a new user please complete the form below and click the submit button.
        </p>

        <div className={styles.card}>

          {/* PERSONAL DETAILS */}
          <h3 className={styles.sectionTitle}>Personal Details</h3>

          <div className={styles.grid4}>
            <div className={styles.field}>
              <label>Title</label>
              <select>
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Mrs.</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name here" />
            </div>

            <div className={styles.field}>
              <label>Email ID*</label>
              <input type="email" placeholder="Enter your business email" />
            </div>
          </div>

          <div className={styles.grid4}>
            <div className={styles.field}>
              <label>Phone Number*</label>
              <div className={styles.phoneRow}>
                <select className={styles.countryCode}>
                  <option>+91</option>
                </select>
                <input type="text" placeholder="Enter phone number" />
              </div>
            </div>

            <div className={styles.field}>
              <label>Job Title</label>
              <input type="text" placeholder="Type here" />
            </div>

            <div className={styles.field}>
              <label>Organisation Type</label>
              <input type="text" placeholder="Type here" />
            </div>

            <div className={styles.field}>
              <label>Organisation Name</label>
              <input type="text" placeholder="Mention your current company" />
            </div>
          </div>

          {/* POSTAL ADDRESS */}
          <h3 className={styles.sectionTitle}>Postal Address</h3>

          <div className={styles.grid4}>
            <div className={styles.field}>
              <label>Street*</label>
              <input type="text" placeholder="Type here" />
            </div>

            <div className={styles.field}>
              <label>Country*</label>
              <select><option>-- Please Select --</option></select>
            </div>

            <div className={styles.field}>
              <label>State*</label>
              <select><option>-- Please Select --</option></select>
            </div>

            <div className={styles.field}>
              <label>City*</label>
              <select><option>-- Please Select --</option></select>
            </div>
          </div>

          {/* COMMENTS + CAPTCHA */}
          <h3 className={styles.sectionTitle}>Additional Information</h3>

          <div className={styles.commentRow}>
            <div className={styles.fieldFlex3}>
              <label>Additional Comments</label>
              <textarea placeholder="Write in 250 characters"></textarea>
            </div>

            <div className={styles.fieldFlex1}>
              <label>Enter Captcha Code</label>
              <div className={styles.captchaRow}>
                <input type="text" placeholder="Enter code" />
                <img
                  src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                  alt="captcha"
                />
              </div>
            </div>
          </div>

          <button className={styles.submitBtn}>Submit</button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default RegistrationPage;

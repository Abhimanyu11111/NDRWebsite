import React, { useState } from "react";
import HeaderWrapper from "../Component/HeaderWrapper";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/Registration.module.css";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    title: "Mr.",
    full_name: "",
    email: "",
    phone: "",
    job_title: "",
    org_type: "",
    org_name: "",
    street: "",
    country: "",
    state: "",
    city: "",
    comments: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      alert("Registration submitted successfully!");

      setFormData({
        title: "Mr.",
        full_name: "",
        email: "",
        phone: "",
        job_title: "",
        org_type: "",
        org_name: "",
        street: "",
        country: "",
        state: "",
        city: "",
        comments: ""
      });
    } else {
      alert("Failed! Try again");
    }
  };

  return (
    <>
      <HeaderWrapper />

      <div className={styles.page}>
        <h2 className={styles.mainTitle}>Registration Form</h2>
        <p className={styles.subtitle}>
          To register as a new user please complete the form below and click the submit button.
        </p>

        <form className={styles.card} onSubmit={handleSubmit}>

          {/* PERSONAL DETAILS */}
          <h3 className={styles.sectionTitle}>Personal Details</h3>

          <div className={styles.grid4}>
            <div className={styles.field}>
              <label>Title</label>
              <select name="title" value={formData.title} onChange={handleChange}>
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Mrs.</option>
                <option>Dr.</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="Enter your name here"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>Email ID*</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your business email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid4}>
            <div className={styles.field}>
              <label>Phone Number*</label>
              <div className={styles.phoneRow}>
                <select disabled className={styles.countryCode}>
                  <option>+91</option>
                </select>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Job Title</label>
              <input
                type="text"
                name="job_title"
                placeholder="Type here"
                value={formData.job_title}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>Organisation Type</label>
              <input
                type="text"
                name="org_type"
                placeholder="Type here"
                value={formData.org_type}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label>Organisation Name</label>
              <input
                type="text"
                name="org_name"
                placeholder="Mention your current company"
                value={formData.org_name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <h3 className={styles.sectionTitle}>Postal Address</h3>

          <div className={styles.grid4}>
            <div className={styles.field}>
              <label>Street*</label>
              <input
                type="text"
                name="street"
                placeholder="Type here"
                value={formData.street}
                onChange={handleChange}
              />
            </div>

            {/* Select + Type allowed */}
            <div className={styles.field}>
              <label>Country*</label>
              <input
                type="text"
                name="country"
                placeholder="Type or Select"
                list="country-list"
                value={formData.country}
                onChange={handleChange}
              />
              <datalist id="country-list">
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Australia</option>
              </datalist>
            </div>

            <div className={styles.field}>
              <label>State*</label>
              <input
                type="text"
                name="state"
                placeholder="Type or Select"
                list="state-list"
                value={formData.state}
                onChange={handleChange}
              />
              <datalist id="state-list">
                <option>Uttar Pradesh</option>
                <option>Maharashtra</option>
                <option>Bihar</option>
                <option>Delhi</option>
              </datalist>
            </div>

            <div className={styles.field}>
              <label>City*</label>
              <input
                type="text"
                name="city"
                placeholder="Type or Select"
                list="city-list"
                value={formData.city}
                onChange={handleChange}
              />
              <datalist id="city-list">
                <option>Noida</option>
                <option>Lucknow</option>
                <option>Patna</option>
                <option>Mumbai</option>
              </datalist>
            </div>
          </div>

          {/* COMMENTS + CAPTCHA */}
          <h3 className={styles.sectionTitle}>Additional Information</h3>

          <div className={styles.commentRow}>
            <div className={styles.fieldFlex3}>
              <label>Additional Comments</label>
              <textarea
                name="comments"
                placeholder="Write in 250 characters"
                value={formData.comments}
                onChange={handleChange}
              ></textarea>
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

          <button type="submit" className={styles.submitBtn}>
            Submit
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default RegistrationPage;

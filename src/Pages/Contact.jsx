import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../Component/Styles/Contact.css";

const Contact = () => {
  return (
    <>
      <Header />

      <div className="continer">
        <div className="contact-page">
        <div className="contact-container">

          <div className="contact-left">
            <h2 className="section-heading"> Get In Touch / Feedback</h2>

            <p className="contact-desc">
              Please do share with us your views / suggestions in the form below
              and we will respond to you as soon as possible.
            </p>

            <form className="contact-form">

              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="Enter your full name" />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input type="email" placeholder="Enter your email" />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea placeholder="Type your message (Max 250 characters)" maxLength="250"></textarea>
              </div>

              <div className="form-group">
                <label>Enter Captcha *</label>
                <div className="captcha-wrapper">
                  <img src="/captcha" alt="captcha" className="captcha-img" />
                  <input type="text" placeholder="Enter code" />
                </div>
              </div>

              <div className="btn-wrapper">
                <button className="send-btn">Send</button>
              </div>

            </form>
          </div>

          <div className="contact-right">

            <div className="info-box">
              <h3> DGH Location</h3>

              <div className="info-item">
                <label>Address</label>
                <p>
                  National Data Repository<br />
                  Directorate General of Hydrocarbons<br />
                  (Under Ministry of Petroleum & Natural Gas)<br />
                  OIDB Bhawan, Plot No 2, Sector 73, Noida<br />
                  UP, India, 201301
                </p>
              </div>

              <div className="info-item">
                <label>Email</label>
                <p>indr@dghindia.gov.in</p>
              </div>

              <div className="info-item">
                <label>Contact Numbers</label>
                <ul>
                  <li>+91-120-247-2578 (HoD-NDR / Chief NDR)</li>
                  <li>+91-120-247-2483 (Web Information Manager)</li>
                  <li>+91-120-247-2551 (Technical Support)</li>
                  <li>+91-120-247-2000 (DGH Reception)</li>
                </ul>
              </div>

              <div className="info-item">
                <label>Business Hours</label>
                <p>9:30 AM – 5:30 PM (UTC +05:30)</p>
              </div>

              <div className="info-item">
                <label>Fax</label>
                <p>+91-120-2472049</p>
              </div>
            </div>

            <div className="map-box">
              <h3>☷ How To Reach ?</h3>

              <iframe
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14006.093217023794!2d77.389097!3d28.581674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cefbdee66b1f5%3A0xd63e5664357c9497!2sOil%20Industry%20Development%20Board!5e0!3m2!1sen!2sin!4v1700000000000"
                loading="lazy"
              ></iframe>
            </div>

          </div>

        </div>
      </div>

      </div>

      

      <Footer />
    </>
  );
};

export default Contact;
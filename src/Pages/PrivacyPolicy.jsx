import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/PrivacyPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const PrivacyPolicy = () => {
  return (
    <>
      <HeaderWrapper />
      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Privacy Policy</h2>

          <h3 className={styles.subTitle}>General</h3>
          <p className={styles.text}>
            This website does not automatically capture any specific personal
            information from you (like name, phone number or e-mail address)
            that allows us to identify you individually. If you choose to
            provide us with your personal information, like names or addresses,
            when you visit our website, we use it only to fulfil your request
            for information.
          </p>

          <p className={styles.text}>
            We do not sell or share any personally identifiable information
            volunteered on this site to any third party (public/private). Any
            information provided to this website will be protected from loss,
            misuse, unauthorised access or disclosure, alteration, or
            destruction.
          </p>

          <h3 className={styles.subTitle}>
            Automatic collection and storage of Information
          </h3>
          <p className={styles.text}>
            We may gather certain information about the User, such as Internet
            protocol (IP) address, domain name, browser type, operating system,
            the date and time of the visit and the pages visited. We make no
            attempt to link these addresses with the identity of individuals
            visiting our site unless an attempt to damage the site has been
            detected.
          </p>

          <h3 className={styles.subTitle}>Personal information</h3>
          <p className={styles.text}>
            We do not collect personal information for any purpose other than
            to respond to you (for example, to respond to your questions). If
            you choose to provide us with personal information – like filling
            up of a “Contact Us” mail, with an e-mail address and pin code, and
            submitting it to us through the website – we use that information
            to respond to your message, and to help you get the information you
            have requested.
          </p>

          <p className={styles.text}>
            We only share the information you give us with another government
            agency if your question relates to that agency, or as otherwise
            required by law. Our website never collects information or creates
            individual profiles for commercial marketing. While you must
            provide an e-mail address for a localised response to your
            questions or comments to us, we recommend you not provide any other
            personal information.
          </p>

          <h3 className={styles.subTitle}>Site Security</h3>
          <p className={styles.text}>
            For site security purposes and to ensure that this website remains
            available to all users, National Data Repository (NDR) implements
            ample mechanisms to monitor network traffic to identify
            unauthorised attempts for DoS/D-DoS or other suspicious cause of
            damage.
          </p>

          <p className={styles.text}>
            Except for authorised law enforcement investigations, no other
            attempts are made to identify individual users or their usage
            habits.
          </p>

          <p className={styles.text}>
            Unauthorised attempts to upload or change information on this
            website are strictly prohibited and may be punishable under the
            Indian IT Act (2000).
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;

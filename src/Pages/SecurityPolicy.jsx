import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/SecurityPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const SecurityPolicy = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Security Policy</h2>

          <p className={styles.text}>
            <strong>Website Security Policy of NDR Website</strong>
          </p>

          <p className={styles.text}>
            NDR has a responsibility to protect from disclosure to unauthorised
            parties the personally identifiable information (name, address,
            date of birth, etc.) of its website users.
          </p>

          <h3 className={styles.subTitle}>Notice and Disclosures</h3>
          <p className={styles.text}>
            NDR will not sell, trade and disclose the personally identifiable
            information of its website users to any third parties.
          </p>

          <h3 className={styles.subTitle}>Data Quality and Access</h3>
          <p className={styles.text}>
            NDR takes all steps possible to ensure that the data on the website
            is accurate. If something is found to be inaccurate, every effort
            will be to correct the same as quickly as possible. The information
            contained on the NDR website is subject to change without prior
            advance notice.
          </p>

          <p className={styles.text}>
            While using the NDR website certain information such as your IP
            Address and time spent on pages may be collected. This non-personal
            information is collected in order to monitor any unauthorised use
            or access to the NDR site. Anyone caught attempting to harm, steal
            information from, or otherwise damage the NDR website will be
            prosecuted under the relevant law.
          </p>

          <h3 className={styles.subTitle}>Data Security</h3>
          <p className={styles.text}>
            NDR website is hosted at DGH (Directorate General of Hydrocarbons)
            Data Centre and is being developed and managed by a team of
            Engineers from NDR, DGH and 3rd party vendor. NDR, DGH has taken
            every precaution to secure information on NDR website.
          </p>

          <p className={styles.text}>
            The site has been audited for website security by CERT-IN
            empanelled agency and has certified to be safe for hosting. The
            hardening of the server has been done as per the CERT-IN empanelled
            agency guidelines. The access to the server is restricted both
            physically and through the network as far as possible. The logs
            are being maintained for authorised physical access to NDR server.
          </p>

          <p className={styles.text}>
            No test environment is available and data upload is not happening
            through SSH or VPN since the website is hosted locally. M/s
            Halliburton has issued dedicated digital certificates to access
            network for user authentication.
          </p>

          <p className={styles.text}>
            Audit and Log of all activities referring to the operating system,
            access to the system and access to applications are maintained as
            and when required. All rejected accesses and services are logged
            and listed in exception reports for further scrutiny.
          </p>

          {/* <h3 className={styles.subTitle}>Disaster Recovery Solution</h3>
          <p className={styles.text}>
            Disaster Recovery Centre of NDR is located at Secondary Data Centre,
            STPI, Bhubaneswar for business continuity in case of disaster
            scenario at Primary Data Centre. Recovery Time Objective (RTO) to
            start the operations from DR Centre is 24 Hours.
          </p> */}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SecurityPolicy;

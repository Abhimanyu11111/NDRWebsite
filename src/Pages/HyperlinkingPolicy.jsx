import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/HyperlinkingPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const HyperlinkingPolicy = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Hyperlinking Policy</h2>

          <h3 className={styles.subTitle}>
            Links to NDR website by other websites
          </h3>

          <p className={styles.text}>
            We do not object to you linking directly to the information that is
            hosted on this web site and no prior permissions required for the
            same. However, we would like anybody to inform us about any links
            provided to this website so that the party can be informed of any
            changes or updates therein.
          </p>

          <p className={styles.text}>
            Also, we do not permit our pages to be loaded into frames on your
            site. The pages belonging to this website must load into a newly
            opened browser window of the User.
          </p>

          <h3 className={styles.subTitle}>
            Links to external websites/portals
          </h3>

          <p className={styles.text}>
            At many places in this website, one will find links to other
            websites/portals. These links have been placed for user convenience.
            NDR is not responsible for the contents of the linked websites and
            does not necessarily endorse the views expressed in them.
          </p>

          <p className={styles.text}>
            Mere presence of the link or its listing on this website should not
            be assumed as endorsement of any kind. We cannot guarantee that
            these links will work all the time and we have no control over
            availability of linked destinations.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HyperlinkingPolicy;

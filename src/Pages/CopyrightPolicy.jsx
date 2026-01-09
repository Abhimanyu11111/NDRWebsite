import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/CopyrightPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const CopyrightPolicy = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Copyright Policy</h2>

          <p className={styles.text}>
            Material featured on this website may be reproduced free of charge.
            However, the material has to be reproduced accurately and not to be
            used in a derogatory manner or in a misleading context.
            Wherever the material is being published or issued to others,
            the source must be prominently acknowledged.
          </p>

          <p className={styles.text}>
            However, the permission to reproduce this material shall not extend
            to any material which is identified as being copyright of a third
            party. Authorisation to reproduce such material must be obtained
            from the department/copyright holder concerned.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CopyrightPolicy;

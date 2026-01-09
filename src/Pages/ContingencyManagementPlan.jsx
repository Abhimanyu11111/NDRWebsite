import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/ContingencyManagementPlan.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const ContingencyManagementPlan = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Contingency Management Plan</h2>

          <p className={styles.text}>
            The NDR website endeavours to be functional and running at all times
            to provide information and services to the users.
          </p>

          <p className={styles.text}>
            All possible efforts will be made to minimise the downtime of the
            website as and when required.
          </p>

          <p className={styles.text}>
            In eventualities like defacement/hacking of the site, data
            corruption, hardware/software crash and natural disasters, all
            efforts will be made to restore the site in the shortest possible
            time.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContingencyManagementPlan;

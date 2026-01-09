import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/SeismicAndWellData.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


//  IMPORT IMAGE
import indiaMap from "../assets/images/stats/india.png";

const IndiaStatsMap = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.pageWrapper}>
        <div className={styles.page}>
          <div className={styles.imageBox}>
            <img
              src={indiaMap}
              alt="2D/3D Seismic and Well Data Loaded in NDR"
              className={styles.image}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default IndiaStatsMap;

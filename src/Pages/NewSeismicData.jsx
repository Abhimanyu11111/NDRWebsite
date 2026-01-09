import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/NewSeismicData.module.css";;
import seismicMap from "../assets/images/FEB2024.jpg";
import HeaderWrapper from "../Component/HeaderWrapper";


const NewSeismicData = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.pageWrapper}>
        <div className={styles.page}>

          {/* Title */}
          <h1 className={styles.title}>
            New 2D Seismic Data acquired under EEZ Survey campaign
            (2023–2024) covering 79,539 LKM are available in NDR
          </h1>

          {/* Content Box */}
          <div className={styles.contentBox}>
            <img
              src={seismicMap}
              alt="New 2D Seismic Data Map"
              className={styles.mapImage}
            />
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default NewSeismicData;

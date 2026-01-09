import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/New2DSeismicData.module.css";
import seismicImg from "../assets/images/Archive2.jpg";
import HeaderWrapper from "../Component/HeaderWrapper";

const New2DSeismicData = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.pageWrapper}>
        <div className={styles.page}>

          {/* Heading */}
          <h1 className={styles.title}>
            New 2D Seismic Data acquired under EEZ Survey campaign (2023–2024)
            covering 79,539 LKM are available in NDR
          </h1>

          {/* Image Section */}
          <div className={styles.imageContainer}>
            <img
              src={seismicImg}
              alt="New 2D Seismic Data Map"
              className={styles.image}
            />
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default New2DSeismicData;

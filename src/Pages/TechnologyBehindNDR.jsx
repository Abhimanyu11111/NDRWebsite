import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/TechnologyBehindNDR.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


// import map1 from "../assets/images/map1.png";
// import map2 from "../assets/images/map2.png";

export default function TechnologyBehindNDR() {
  return (
    <>
      <HeaderWrapper />

      <div className={styles.container}>
        <h2 className={styles.title}>Technology Behind the NDR</h2>

        <ul className={styles.list}>
          <li>NDR Halliburton Technology – MDS PetroBank to manage E&amp;P data.</li>
          <li>
            The PetroBank Master Data Store software is a leading E&amp;P database solution for storage,
            preservation, and distribution of seismic, well, production, gravity, magnetic, electromagnetics,
            well logs data, and related technical information.
          </li>
          <li>
            The PetroBank Master Data Store software also allows E&amp;P professionals to rapidly locate, access,
            and retrieve data in standard industry formats used with Geo-science applications.
          </li>
          <li>
            End user can browse, visualize, and order data stored in the PetroBank Master Data Store software.
          </li>
          <li>
            The PetroBank Master Data Store application offers multi-level security, imposing tight controls on
            access to the network, data, systems, applications, and physical data bank. Extensive security
            features include full setting of entitlements, mechanisms for intruder alerts and disaster recovery.
          </li>
          <li>
            Other features include GIS based data viewing, data previewing, data selection and data ordering.
          </li>
        </ul>

        <div className={styles.imageBox}>
          {/* <img src={map1} alt="GIS viewing and data previewing" className={styles.image} /> */}
          <p className={styles.caption}>GIS viewing, data previewing, and data ordering and delivery map</p>
        </div>

        <div className={styles.imageBox}>
          {/* <img src={map2} alt="GIS viewing and data previewing" className={styles.image} /> */}
          <p className={styles.caption}>GIS viewing, data previewing, and data ordering and delivery map</p>
        </div>
      </div>

      <Footer />
    </>
  );
}

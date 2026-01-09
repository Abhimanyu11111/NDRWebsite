import React from "react";
import { Link } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/Archives.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const Archives = () => {
  return (
    <>
      <HeaderWrapper />

      <div className={styles.archiveWrapper}>
        {/* Archives by Month */}
        <div className={styles.archiveBox}>
          <h2>Archives by Month:</h2>
          <ul>
            <li>
              <Link to="/newSeismicData">February 2024</Link>
            </li>
            <li>
              <Link to="/revisedDataSubmission">January 2023</Link>
            </li>
          </ul>
        </div>

        {/* Archives by Year */}
        <div className={styles.archiveBox}>
          <h2>Archives by Year:</h2>
          <ul>
            <li>
              <Link to="/new2DSeismicData">2024</Link>
            </li>
            <li>
              <Link to="/revisedDataSubmission">2023</Link>
            </li>
          </ul>
        </div>

        {/* Archives by Subject */}
        <div className={styles.archiveBox}>
          <h2>Archives by Subject:</h2>
          <ul>
            <li>Categories</li>
            <ul className={styles.subList}>
              <li>
                <Link to="/new2DSeismicData">New</Link>
              </li>
            </ul>
          </ul>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Archives;

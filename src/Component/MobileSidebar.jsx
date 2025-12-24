import React from "react";
import { Link } from "react-router-dom";
import styles from "../Component/Styles/Header.module.css";
import { FiX } from "react-icons/fi";

const MobileSidebar = ({ isOpen, onClose }) => {
    
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <div className={`${styles.mobileSidebar} ${isOpen ? styles.show : ""}`}>
        <div className={styles.sidebarHeader}>
          {/* <span>Menu</span> */}
          <FiX onClick={onClose} />
        </div>

        <nav className={styles.sidebarNav}>
          <Link className={styles.sidebarNavLink} to="/" onClick={onClose}>Home</Link>
          <Link className={styles.sidebarNavLink} to="/about" onClick={onClose}>About NDR</Link>

          <details>
            <summary>Pages</summary>
            <Link to="/objective">Objective</Link>
            <Link to="/operationalModel">Operational Model</Link>
            <Link to="/salientFeatures">Salient Features</Link>
            <Link to="/policies">Policies</Link>
          </details>

          <details>
            <summary>Important Links</summary>
            <a className={styles.sidebarNavLink} href="https://dghindia.gov.in/" target="_blank">DGH</a>
            <a className={styles.sidebarNavLink} href="https://india.gov.in/" target="_blank">India.gov.in</a>
            <a className={styles.sidebarNavLink} href="https://mopng.gov.in/en" target="_blank">MoPNG</a>
          </details>

          <Link className={styles.sidebarNavLink} to="/contact" onClick={onClose}>Contact</Link>

          <a className={styles.buttonText} className={styles.sidebarBtn}>Log in</a>
          <a className={styles.buttonText} className={styles.sidebarBtn}>Register</a>
        </nav>
      </div>
    </>
  );
};

export default MobileSidebar;

import React, { useState } from "react";
import styles from "../Component/Styles/Header.module.css";
import Logo from "../assets/images/Emblem.png";
import { FiSearch } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import ReactCountryFlag from "react-country-flag";
import MobileSidebar from "./MobileSidebar";

const MobileHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== GOV TOP STRIP ===== */}
      <div className={styles.govTopStrip}>
        <div className={styles.govStripLeft}>
          <span>
            An Official website of <strong>Government of India</strong>
          </span>
          <ReactCountryFlag countryCode="IN" svg style={{ margin: "0px 2px", width: "2em", height: "2em" }} />
        </div>

        <div className={styles.govStripRight}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search"
              className={styles.search}
            />
            <FiSearch className={styles.searchIcon} />
          </div>
        </div>
      </div>

      {/* ===== MAIN MOBILE HEADER ===== */}
      <div className={styles.topBarMobile}>
        {/* HAMBURGER */}
        <button
          className={styles.hamburgerBtn}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <GiHamburgerMenu />
        </button>

        {/* TITLE */}
        <h2 className={styles.mobileTitle}>
          National Data Repository
        </h2>

        {/* LOGO */}
        <div className={styles.logoBox}>
          <img src={Logo} alt="Government Emblem" />
        </div>
      </div>

      {/* ===== SIDEBAR ===== */}
      <MobileSidebar isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MobileHeader;

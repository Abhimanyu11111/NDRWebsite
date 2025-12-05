import React from "react";
import ReactCountryFlag from "react-country-flag";
import styles from "../Pages/Styles/Home.module.css";
import Logo from "../assets/Images/Emblem.png";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const Header = () => {
  return (
    <header className={styles.headerWrapper}>
      {/* Top Blue Bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.navbarnew}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0px 0.8rem",
              }}
            >
              <span>
                An Official website of <strong>Government of India</strong>
              </span>
              <ReactCountryFlag
                countryCode="IN"
                svg
                style={{ width: "2em", height: "2em" }}
              />
            </div>
            <div className={styles.langBtn}>English</div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container">
        <div className={styles.mainHeader}>
          <div className={styles.leftSection}>
            <img src={Logo} alt="Government Emblem" className={styles.logo} />
            <div>
              <h2 className={styles.title}>National Data Repository</h2>
              <p className={styles.subtitle}>
                Directorate General of Hydrocarbons (DGH)
              </p>
              <p className={styles.ministry}>
                Ministry of Petroleum and Natural Gas, Government of India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="container">
        <div className={styles.searchandnavbarbox}>
          <nav className={styles.navBar}>
            <div><Link to="/">Home</Link></div>
            <div><Link to="/about">About NDR</Link></div>

            <div className={styles.dropdown}>
              <span>Related Pages ▾</span>
              <div className={styles.dropdownContent}>
                <Link to="/objective">Objective</Link>
                <Link to="/operationalModel">Operational Model</Link>
                <Link to="/salientFeatures">Salient Features</Link>
                <Link to="/policies">Policies</Link>
                <Link to="/sedimentaryBasins">Sedimentary Basins</Link>
                <Link to="/help">Help</Link>
              </div>
            </div>

            <div><Link to="/contact">Contact</Link></div>
          </nav>


          <div className={styles.searchandlogin}>

          {/* Search Icon + Input */}
          <div className={styles.rightSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search"
                className={styles.search}
              />
              <FiSearch className={styles.searchIcon} />
            </div>
          </div>

          {/* Buttons */}
          <button className={styles.loginBtn}>
            <a
              target="_blank"
              style={{ color: "white", textDecoration: "none" }}
              href="https://www.ndrdgh.gov.in/NDRTWS/system/mainframe.asp"
            >
              Log in
            </a>
          </button>

          <button className={styles.registerBtn}>
            <a
              target="_blank"
              style={{ color: "white", textDecoration: "none" }}
              href="https://www.ndrdgh.gov.in/NDR/?page_id=1486"
            >
              Register
            </a>
          </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import ReactCountryFlag from "react-country-flag";
import styles from "../Pages/Styles/Home.module.css";
import Logo from "../assets/Images/Emblem.png";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const Header = () => {
  return (
    <header className={styles.headerWrapper}>
      
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.navbarnew}>
            <div className={styles.govTextBox}>
              <span>
                An Official website of <strong>Government of India</strong>
              </span>
              <ReactCountryFlag
                countryCode="IN"
                svg
                className={styles.flagIcon}
              />
            </div>
            <button className={styles.langBtn}>English</button>
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

      {/* Navigation + Search */}
      <div className="container">
        <div className={styles.navSearchWrapper}>

          <nav className={styles.navBar}>
            <div>
    <Link to="/">Home</Link>
            </div>

            <div>
   <Link to="/about">About NDR</Link>
            </div>
        
         

            {/* Dropdown - Pages */}
            <div className={styles.dropdown}>
              <span>Pages ▾</span>
              <div className={styles.dropdownContent}>
                <Link to="/objective">Objective</Link>
                <Link to="/operationalModel">Operational Model</Link>
                <Link to="/salientFeatures">Salient Features</Link>
                <Link to="/policies">Policies</Link>
                <Link to="/sedimentaryBasins">Sedimentary Basins</Link>
                <Link to="/help">Help</Link>
              </div>
            </div>

            {/* Dropdown - Important Links */}
            <div className={styles.dropdown}>
              <span>Important Links ▾</span>
              <div className={styles.dropdownContent}>
                <a href="https://dghindia.gov.in/" target="_blank">Directorate General Of HydroCarbons</a>
                <a href="https://india.gov.in/" target="_blank">National Portal Of India</a>
                <a href="https://mopng.gov.in/en" target="_blank">Ministry Of Petroleum & Natural Gas</a>
                <a href="https://www.oisd.gov.in/" target="_blank">Oil Industry Safety Directorate</a>
                <a href="http://www.moef.gov.in/" target="_blank">MoEF & CC</a>
                <a href="http://dgms.gov.in/" target="_blank">DGMS</a>
                <a href="http://ppac.org.in/" target="_blank">PPAC</a>
              </div>
            </div>

            {/* Dropdown - Download */}
            <div className={styles.dropdown}>
              <span>Download ▾</span>
              <div className={styles.dropdownContent}>
                <a href="https://www.ndrdgh.gov.in/NDR/?page_id=11708/" target="_blank">
                  Data Price List & Policies
                </a>
              </div>
            </div>

            <Link to="/contact">Contact</Link>
          </nav>

          {/* Search + Login/Register */}
          <div className={styles.searchandlogin}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search"
                className={styles.search}
              />
              <FiSearch className={styles.searchIcon} />
            </div>

            <a
              href="https://www.ndrdgh.gov.in/NDRTWS/system/mainframe.asp"
              target="_blank"
              className={styles.loginBtn}
            >
              Log in
            </a>

            <a
              href="https://www.ndrdgh.gov.in/NDR/?page_id=1486"
              target="_blank"
              className={styles.registerBtn}
            >
              Register
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;

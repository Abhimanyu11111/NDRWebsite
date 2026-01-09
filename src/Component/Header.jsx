import React, { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import styles from "../Pages/Styles/Home.module.css";
import Logo from "../assets/images/Emblem.png";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const Header = () => {
  // Detect current language from Google Translate cookie
  const [lang] = useState(
    document.cookie.includes("googtrans=/en/hi") ? "hi" : "en"
  );





  // Govt-style language toggle (cookie + reload)
  const toggleLanguage = () => {
    if (lang === "en") {
      window.setLanguage("hi");
    } else {
      window.setLanguage("en");
    }
  };

  return (
    <header className={styles.headerWrapper}>
      {/* ================= TOP BAR ================= */}
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
                style={{ height: "2em", width: "2em", margin: "0 5px" }}
              />
            </div>

            <div className={styles.topRightButtons}>
              <Link to="/help" className={styles.helpBtn}>
                Help
              </Link>

              {/*  Language Toggle  */}
              <button onClick={toggleLanguage} className={styles.langBtn}>
                <span className={styles.langIcon}>अ / A</span>
                {lang === "en" ? " हिंदी" : " English"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
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

      {/* ================= NAV + SEARCH ================= */}
      <div className="container">
        <div className={styles.navSearchWrapper}>
          <nav className={styles.navBar}>
            <Link to="/">Home</Link>
            <Link to="/about">About NDR</Link>

            {/* Pages Dropdown */}
            <div className={styles.dropdown}>
              <span>Pages ▾</span>
              <div className={styles.dropdownContent}>
                <Link to="/objective">Objective</Link>
                <Link to="/operationalModel">Operational Model</Link>
                <Link to="/salientFeatures">Salient Features</Link>
                <Link to="/policies">Policies</Link>
                <Link to="/sedimentaryBasins">Sedimentary Basins</Link>
              </div>
            </div>

            {/* Important Links Dropdown */}
            <div className={styles.dropdown}>
              <span>Important Links ▾</span>
              <div className={styles.dropdownContent}>
                <a
                  href="https://dghindia.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directorate General Of HydroCarbons
                </a>
                <a
                  href="https://india.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  National Portal Of India
                </a>
                <a
                  href="https://mopng.gov.in/en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ministry Of Petroleum & Natural Gas
                </a>
                <a
                  href="https://www.oisd.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Oil Industry Safety Directorate
                </a>
                <a
                  href="https://www.moef.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MoEF & CC
                </a>
                <a
                  href="https://dgms.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directorate General Of Mines Safety
                </a>
              </div>
            </div>

            {/* Download Dropdown */}
            <div className={styles.dropdown}>
              <span>Download ▾</span>
              <div className={styles.dropdownContent}>
                <a
                  href="/DownloadDataPriceListPolicies"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Data Price List & Policies
                </a>
              </div>
            </div>

            <Link to="/contact">Contact</Link>
          </nav>

          {/* Search + Auth */}
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
              href="https://enterprise-search.dsif.nicmeghrajprj1.ienergycloud.solutions/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.loginBtn}
            >
              Log in
            </a>

            <Link to="/registration" className={styles.registerBtn}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

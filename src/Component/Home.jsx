import ReactCountryFlag from "react-country-flag";
import { IoCheckmarkCircle } from "react-icons/io5";
import React from "react";
import styles from "./Styles/Home.module.css";
import hero_img from "../assets/Images/heroimg.png"
import Logo from "../assets/Images/Emblem.png"
import Basin from "../assets/Images/Basin.png"
import Data from "../assets/Images/Data.png"
import Open from "../assets/Images/Open.png"
// import footerlogo from "../assets/Images/emblem1.png"
import Twitter from "../assets/Images/Twitter.png"
import Facebook from "../assets/Images/Facebook.png"
import Footer from "./Footer";
const Home2 = () => {

  const cards = [
    {
      img: Basin,
      title: "Basin Data",
      points: [
        "Explore India's sedimentary basins",
        "Access seismic, well, and field data"
      ]
    },
    {
      img: Open,
      title: "Open Acreage Licensing",
      points: [
        "Download E&P datasets",
        "Basin study reports and survey data"
      ]
    },
    {
      img: Data,
      title: "Data Packages",
      points: [
        "Policy framework",
        "User manuals & compliance"
      ]
    }
  ];

  return (


    <>
      <header className={styles.headerWrapper}>
        {/* Top Blue Bar */}
        <div className={styles.topBar}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0px 0.8rem" }}>
            <span>An Official website of <strong>Government of India</strong></span>
            <ReactCountryFlag countryCode="IN" svg style={{ width: '2em', height: '2em' }} />

          </div>
          <div className={styles.langBtn}>English</div>
        </div>

        {/* Main Header */}



        <div className="container">

          <div className={styles.mainHeader}>
            <div className={styles.leftSection}>
              <img
                src={Logo}
                alt="Government Emblem"
                className={styles.logo}
              />

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
              <div>
                <a href="#">Home</a>
              </div>

              <div>
                <a target="_blank" href="https://www.ndrdgh.gov.in/NDR/?page_id=6">About NDR </a>
              </div>


              {/* <a href="#">Related Portals ▾</a> */}




              <div className={styles.dropdown}>
                {/* <button className={styles.dropBtn}>Related Portals ▾</button> */}
                <a href="#">Related Portals ▾</a>

                <div className={styles.dropdownContent}>

                  <a href="http://dghindia.gov.in/" target="_blank">Directorate General of Hydrocarbons</a>
                  <a href="http://india.gov.in" target="_blank">National Portal of India</a>
                  <a href="http://mopng.gov.in/en" target="_blank">Ministry of Petroleum and Natural Gas</a>
                  <a href="https://www.oisd.gov.in/" target="_blank">Oil Industry Safety Directorate</a>
                  <a href="http://www.moef.gov.in/" target="_blank">Ministry of Environment, Forest and Climate Change</a>
                  <a href="http://dgms.gov.in/" target="_blank">Directorate General of Mines Safety</a>
                  <a href="http://ppac.org.in/" target="_blank">Petroleum Planning & Analysis Cell</a>

                </div>
              </div>


              <div>
                <a target="_blank" href="https://www.ndrdgh.gov.in/NDR/?page_id=8">Contact</a>
              </div>




            </nav>

            <div className={styles.rightSection}>
              <input
                className={styles.search}
                type="text"
                placeholder="Search"
              />
              <button className={styles.loginBtn}> <a target="_blank" style={{ color: "white", textDecoration: "none" }} href="https://www.ndrdgh.gov.in/NDRTWS/system/mainframe.asp">Log in</a></button>
              <button className={styles.registerBtn}> <a target="_blank" style={{ color: "white", textDecoration: "none" }} href="https://www.ndrdgh.gov.in/NDR/?page_id=1486">Register</a></button>
            </div>
          </div>


        </div>


      </header>

      <div className="orangegradinet">
        <div className="container">
          <section className={styles.hero}>


            <div className={styles.left}>
              <h1>National Data Repository</h1>
              <h3>Come, Explore, Research & Invest</h3>

              <p>
                <strong>National Data Repository (NDR)</strong> was launched for public on{" "}
                <strong>28th July 2017</strong>. NDR is a fully Government of India
                owned E&P data repository.
              </p>

              <div className={styles.buttons}>
                <button className={styles.exploreBtn}>
                  Explore Data <span>→</span>
                </button>

                <button className={styles.learnBtn}>
                  Learn more
                </button>
              </div>
            </div>

            <div className={styles.right}>
              <img src={hero_img} alt="NDR" />
            </div>
          </section>
        </div>
      </div>




      <section className={styles.statsSection}>
        <div className={styles.statItem}>
          <IoCheckmarkCircle style={{ color: "green", fontSize: "2rem" }} />
          <h3>26</h3>
          <p>Sedimentary basins covered</p>
        </div>

        <div className={styles.dot}></div>

        <div className={styles.statItem}>
          <IoCheckmarkCircle style={{ color: "green", fontSize: "2rem" }} />
          <h3>X+ TB</h3>
          <p>Of seismic and well data</p>
        </div>

        <div className={styles.dot}></div>

        <div className={styles.statItem}>
          <IoCheckmarkCircle style={{ color: "green", fontSize: "2rem" }} />
          <h3>10,000+</h3>
          <p>wells with digital data</p>
        </div>
      </section>

      <section className={styles.cardsWrapper}>

        {/* Card 1 */}





        {/* <div className={styles.cards}> */}
        {cards.map((item, index) => (
          <div className={styles.card} key={index}>

            <img src={item.img} className={styles.cardImg} />
            <h3>{item.title}</h3>

            <ul>
              {item.points.map((p, i) => (
                <li style={{ fontWeight: "600", fontSize: "17px" }} key={i}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
        {/* </div> */}







      </section>

      <div className="container">
        <section className={styles.wrapper}>

          {/* LEFT BOX */}
          <div className={styles.leftbox}>
            <h2>Data Categories</h2>

            <ol className={styles.list}>
              <li>Seismic data <span>›</span></li>
              <li>Well data <span>›</span></li>
              <li>Survey data <span>›</span></li>
              <li>Reports and studies <span>›</span></li>
              <li>GIS layers <span>›</span></li>
              <li>Data packages <span>›</span></li>
            </ol>

            <button className={styles.viewBtn}>
              View All <span>›</span>
            </button>
          </div>

          {/* RIGHT BOX */}
          <div className={styles.rightbox}>
            <h2>Latest Announcements</h2>

            <ul className={styles.annList}>
              <li>OALP Round Update – Bid submission deadline extended</li>
              <li>New basin study report published for Cambay Basin</li>
              <li>Data package DP-32 now available</li>
              <li>Scheduled maintenance notice</li>
              <li>Updated data package DP-42</li>
              <li>New well logs added</li>
              <li>GIS layer enhancement</li>
            </ul>

            <button className={styles.viewBtn}>
              View All <span>›</span>
            </button>
          </div>

        </section>
      </div>

      <div className="footerbackground">
        <div className="container">
          <section className={styles.footerhero}>
            <div className={styles.overlay}></div>

            <div className={styles.content}>
              <h1>National Data Repository</h1>

              <h3>Come, explore, research & invest</h3>

              <p>
                Access India's authenticated E&P datasets including seismic, well, reservoir, and
                GIS information. Explore basin studies, licensing rounds, and high-quality
                geological data to support investment and research.
              </p>

              <div className={styles.buttons}>
                <button className={styles.exploreBtn}>
                  Explore Data <span>→</span>
                </button>

                <button className={styles.learnBtn}>
                  Learn more
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>


      <Footer />

    </>
  );
};

export default Home2;

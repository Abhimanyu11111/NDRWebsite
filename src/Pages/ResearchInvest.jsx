import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/ResearchInvest.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const ResearchInvest = () => {
  return (
    <>
      <HeaderWrapper />

      <div className="container">
        <div className={styles.pageWrapper}>
          <h1>Research and Invest in India</h1>

          <section>
            <h2>Introduction to Petroleum Acreage</h2>
            <p>
              Directorate General of Hydrocarbons (DGH) under the aegis of
              Ministry of Petroleum and Natural Gas, Govt of India actively
              assesses and promotes the hydrocarbon exploration and production
              activities in India. While oil exploration has been occurring since
              the early 1860s in India, it is the past 40 years that have seen
              significant exploration, production and marketing developments.
            </p>
            <p>
              Acreage releases are going to be made through OALP (Open Acreage
              Licensing Policy) with defined periodicity for the areas within
              India’s jurisdiction.
            </p>

            <p>Information documents and data packages are available for:</p>
            <ul>
              <li>Hydrocarbon prospectivity</li>
              <li>Lists of available G&amp;G data</li>
              <li>Details on how and when applications are to be made</li>
              <li>
                Assessment criteria by which applications are to be considered
              </li>
              <li>Land access information (Native Title and environment)</li>
              <li>Other information pertinent to the particular areas.</li>
            </ul>

            <p>
              The available acreages that did not attract successful bids in the
              previous cycle and are not licensed to any other operator for E&amp;P
              activities are generally re-released in the following cycle.
            </p>
          </section>

          <section>
            <h2>Opportunities and Developments in India</h2>
            <p>
              India is one of the fastest growing economies in the world. Strong
              GDP growth rate have resulted in a surging demand for energy
              including oil &amp; gas. India is the fourth largest primary energy
              consumer, after China, USA and Russia. The Government has taken
              number of measures to bring in healthy competition and public
              participation by the way, of New Exploration and Licensing Policy
              (NELP) for exploration &amp; production of oil &amp; gas in the country.
            </p>
            <p>
              The total basin area of the 26 sedimentary basins of India is close
              to 3.36 million sq km with on-land area of 1.63 million sq km and
              shallow-water of 0.41 million sq km. In the deep waters beyond the
              400m isobath, the sedimentary area has been estimated to be about
              1.32 million sq km.
            </p>

            <p>
              As on 31.03.2019, 0.099 million sq km. area is held under Petroleum
              Exploration Licenses (PELs) and 0.071 million sq km. area is held
              under Petroleum Mining Licenses (PMLs).
            </p>

            <p>To find out more about India including:</p>
            <ul>
              <li>Major resource producers — ONGC, OIL, Reliance, GSPC, Cairn</li>
              <li>Top Marketing companies — IOCL, BPCL, HPCL, GAIL, Reliance</li>
            </ul>

            <p>Visit the Govt of India’s website for more information.</p>
          </section>

          <section>
            <h2>Economic Profile</h2>
            <p>
              Energy drives the economic growth of a country. Crude Oil and
              Natural Gas is a vital source of primary energy in India. Domestic
              availability has not kept pace with demand resulting in increased
              imports affecting India’s energy security.
            </p>
            <p>
              It is imperative to attract more private and foreign companies to
              invest in E&amp;P sector by creating an investor-friendly climate
              through policy reforms and efficient processes.
            </p>
          </section>

          <section>
            <h2>Investment Opportunities in India</h2>
            <p>
              India faces formidable challenges in meeting its energy
              requirements. There is urgent need to rapidly explore more areas
              to discover oil &amp; gas and unconventional resources. Govt is
              focusing on policy reforms, reduction of regulatory barriers,
              development of marginal fields and un-monetised discoveries.
            </p>
            <p>
              To find out more about investment opportunities in India, visit the
              Govt of India’s website.
            </p>
          </section>

          <section>
            <h2>How to apply for acreage</h2>
            <p>
              The acreages will be available throughout the year as per Open
              Acreage License Policy / Uniform License Policy.
            </p>
            <p>
              Online application link:{" "}
              <a
                href="https://online.dghindia.org/oalp"
                target="_blank"
                rel="noreferrer"
              >
                https://online.dghindia.org/oalp
              </a>
            </p>
          </section>

          <section>
            <h2>Environmental Requirements</h2>
            <p>
              The department ensures environmental best practices for petroleum
              resource development through regulatory, audit and monitoring
              services.
            </p>
          </section>

          <section>
            <h2>Clearances</h2>
            <p>
              All vessels, drilling rigs and related equipment for E&amp;P in India
              need security clearances from Ministry of Defence which are
              processed by DGH.
            </p>
          </section>

          <section>
            <h2>Obtaining Geo-science Data</h2>
            <p>
              Public E&amp;P data can be accessed via online systems through NDR
              data portal (registered users). Price list &amp; refund/cancellation
              policies available on the portal.
            </p>
          </section>

          <section>
            <h2>Legislation</h2>
            <p>
              The Government of India controls all laws and rules for petroleum
              exploration and development.
            </p>
          </section>

          <section>
            <h2>Further Information</h2>
            <p>
              Guidance is available for companies investing or operating in India
              from DGH and the Ministry of Petroleum &amp; Natural Gas.
            </p>
          </section>

          <section className={styles.contactBox}>
            <h2>Enquiries:</h2>
            <p>
              General/ Data enquiries — indr@dghindia.gov.in <br />
              HoD-NDR: +91-120-247-2578 <br />
              NDR Reception: +91-120-247-2548 <br />
              DGH Reception: +91-120-247-2000
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ResearchInvest;

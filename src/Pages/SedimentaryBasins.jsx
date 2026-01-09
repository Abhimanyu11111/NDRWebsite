import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/sedimentary.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const SedimentaryBasins = () => {
  return (
    <>
      <HeaderWrapper />

      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h2 className={styles.pageTitle}>Major Sedimentary Basins in India.</h2>

          <p className={styles.pageIntro}>
            India has an estimated sedimentary area of 3.36 million sq km, comprising of
            26 sedimentary basins, out of which; 1.63 million sq km, area is in on-land,
            shallow offshore up-to 400m isobath have an areal extent of 0.41 million sq km,
            and deep-water beyond 400m isobath having sedimentary area of 1.32 million sq km,
            areas are per renewed categorisation of sedimentary basins.
          </p>

          <p className={styles.pageIntro}>
            Over the last few years, there have been a significant forward leap in exploring
            the hydrocarbon potential of the sedimentary basins of India. Unexplored area has
            come down significantly as a result of the surveys carried out by DGH in unexplored/
            poorly explored areas of the country including Deep-waters and acreages awarded for
            exploration under NELP/OALP rounds. Concerned efforts are continuously being done to
            reduce the unexplored area further.
          </p>

          <p className={styles.pageIntro}>
            These 26 Indian sedimentary basins have been divided into three categories based on
            their degree of prospectivity.
          </p>

          {/* Category 1 */}
          <h3 className={styles.sectionTitle}>
            Category I : Basins with reserves being produced and potential to be exploited at increased recovery
          </h3>

          <div className={styles.tableBox}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Basin Name</th>
                  <th>Area Onland</th>
                  <th>Area Shallow-water</th>
                  <th>Area Deepwater</th>
                  <th>Area Total</th>
                </tr>
              </thead>

              <tbody>
                <tr><td>Krishna-Godavari</td><td>31,486</td><td>13,680</td><td>1,72,218</td><td>2,30,000</td></tr>
                <tr><td>Kaveri</td><td>58,500</td><td>800</td><td>-</td><td>59,300</td></tr>
                <tr><td>Assam Shelf</td><td>56,000</td><td>-</td><td>-</td><td>56,000</td></tr>
                <tr><td>Rajasthan</td><td>1,26,000</td><td>-</td><td>-</td><td>1,26,000</td></tr>
                <tr><td>Cambay</td><td>48,832</td><td>6,818</td><td>-</td><td>55,650</td></tr>
              </tbody>
            </table>
          </div>

          {/* Category 2 */}
          <h3 className={styles.sectionTitle}>
            Category II : Basins with contingent resources to be developed and produced
          </h3>

          <div className={styles.tableBox}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Basin Name</th>
                  <th>Area Onland</th>
                  <th>Area Shallowwater</th>
                  <th>Area Deepwater</th>
                  <th>Area Total</th>
                </tr>
              </thead>

              <tbody>
                <tr><td>Saurashtra</td><td>79,705</td><td>42,617</td><td>78,421</td><td>1,94,114</td></tr>
                <tr><td>Kutch</td><td>20,295</td><td>-</td><td>-</td><td>20,295</td></tr>
                <tr><td>Vindhyan</td><td>2,08,835</td><td>-</td><td>-</td><td>2,08,835</td></tr>
                <tr><td>Andaman-Nicobar</td><td>18,074</td><td>2,07,848</td><td>2,25,918</td><td>2,25,918</td></tr>
              </tbody>
            </table>
          </div>

          {/* Category 3 */}
          <h3 className={styles.sectionTitle}>
            Category III : Basins with only prospective resources to be explored and discovered
          </h3>

          <div className={styles.tableBox}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Basin Name</th>
                  <th>Area Onland</th>
                  <th>Area Shallowwater</th>
                  <th>Area Deepwater</th>
                  <th>Area Total</th>
                </tr>
              </thead>

              <tbody>
                <tr><td>Karewa-Kashmir</td><td>7,000</td><td>10,838</td><td>4,92,420</td><td>5,10,258</td></tr>
                <tr><td>Pranhita Godavari</td><td>19,000</td><td>-</td><td>-</td><td>19,000</td></tr>
                <tr><td>Chhattisgarh</td><td>32,000</td><td>-</td><td>-</td><td>32,000</td></tr>
                <tr><td>Himalayan Foreland</td><td>50,000</td><td>-</td><td>-</td><td>50,000</td></tr>
                <tr><td>Bastar</td><td>3,360</td><td>-</td><td>-</td><td>3,360</td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default SedimentaryBasins;

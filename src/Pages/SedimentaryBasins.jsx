import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../Component/Styles/sedimentary.module.css";

const SedimentaryBasins = () => {
  return (
    <>
      <Header />

      <div className="container">
<div className="sedimentary-container">
        <div className="sedimentary-card">
          <h2>Major Sedimentary Basins in India</h2>

          <p>
            India has an estimated sedimentary area of 3.36 million sq km,
            comprising of 26 sedimentary basins, out of which; 1.63 million sq km. area is in on-land,
            shallow offshore up-to 400m isobath have an areal extent of 0.41 million sq km. and
            deep-water beyond 400m isobath having sedimentary area of 1.32 million sq km. area as per
            renewed categorisation of sedimentary basins.
          </p>

          <p>
            Over the last few years, there have been a significant forward leap in exploring the
            hydrocarbon potential of the sedimentary basins of India. The unexplored area has come down
            significantly as a result of the surveys carried out by DGH in unexplored/poorly explored
            areas of the country including Deep-waters and acreages awarded for exploration under
            NELP/OALP rounds. Concerned efforts are continuously being done to reduce the unexplored
            area further.
          </p>

          <p>
            These 26 Indian sedimentary basins have been divided into three categories based on their
            degree of prospectivity.
          </p>

          <h3>Category I :</h3>
          <p>(Basins with reserves being produced and potential to be exploited at increased recovery)</p>
          
          <table>
            <thead>
              <tr>
                <th>Basin Name</th>
                <th>Area On-land</th>
                <th>Area Shallow-water</th>
                <th>Area Deep-water</th>
                <th>Area Total</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Krishna-Godawari</td><td>31,456</td><td>25,649</td><td>1,72,895</td><td>2,30,000</td></tr>
              <tr><td>Mumbai Offshore</td><td>–</td><td>1,18,389</td><td>93,611</td><td>2,12,000</td></tr>
              <tr><td>Assam Shelf</td><td>56,000</td><td>–</td><td>–</td><td>56,000</td></tr>
              <tr><td>Rajasthan</td><td>1,26,000</td><td>–</td><td>–</td><td>1,26,000</td></tr>
              <tr><td>Cauvery</td><td>37,825</td><td>43,723</td><td>1,58,452</td><td>2,40,000</td></tr>
              <tr><td>Assam-Arakan Fold Belt</td><td>80,825</td><td>–</td><td>–</td><td>80,825</td></tr>
              <tr><td>Cambay</td><td>48,882</td><td>4,618</td><td>–</td><td>53,500</td></tr>
            </tbody>
          </table>

          <h3>Category II :</h3>
          <p>(Basins with contingent resources to be developed and produced)</p>

          <table>
            <thead>
              <tr>
                <th>Basin Name</th>
                <th>Area On-land</th>
                <th>Area Shallow-water</th>
                <th>Area Deep-water</th>
                <th>Area Total</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Saurashtra</td><td>75,076</td><td>42,617</td><td>76,421</td><td>1,94,114</td></tr>
              <tr><td>Kutch</td><td>30,754</td><td>20,500</td><td>7,300</td><td>58,554</td></tr>
              <tr><td>Vindhyan</td><td>2,02,888</td><td>–</td><td>–</td><td>2,02,888</td></tr>
              <tr><td>Mahanadi</td><td>15,500</td><td>14,211</td><td>69,789</td><td>99,500</td></tr>
              <tr><td>Andaman-Nicobar</td><td>–</td><td>18,074</td><td>2,07,844</td><td>2,25,918</td></tr>
            </tbody>
          </table>

          <h3>Category III :</h3>
          <p>(Basins with only prospective resources to be explored and discovered)</p>

          <table>
            <thead>
              <tr>
                <th>Basin Name</th>
                <th>Area On-land</th>
                <th>Area Shallow-water</th>
                <th>Area Deep-water</th>
                <th>Area Total</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Kerala-Konkan</td><td>–</td><td>90,380</td><td>4,89,620</td><td>5,80,000</td></tr>
              <tr><td>Bengal-Purnea</td><td>42,414</td><td>33,465</td><td>46,035</td><td>1,21,914</td></tr>
              <tr><td>Ganga Punjab</td><td>3,04,000</td><td>–</td><td>–</td><td>3,04,000</td></tr>
              <tr><td>Pranhita Godavari</td><td>30,000</td><td>–</td><td>–</td><td>30,000</td></tr>
              <tr><td>Satpura-S.Rewa-Damodar</td><td>57,180</td><td>–</td><td>–</td><td>57,180</td></tr>
              <tr><td>Himalyan Foreland</td><td>30,110</td><td>–</td><td>–</td><td>30,110</td></tr>
              <tr><td>Chhattisgarh</td><td>32,000</td><td>–</td><td>–</td><td>32,000</td></tr>
              <tr><td>Narmada</td><td>95,215</td><td>–</td><td>–</td><td>95,215</td></tr>
              <tr><td>Spiti Zanskar</td><td>32,000</td><td>–</td><td>–</td><td>32,000</td></tr>
              <tr><td>Deccan Syneclise</td><td>2,37,500</td><td>–</td><td>–</td><td>2,37,500</td></tr>
              <tr><td>Cuddapah</td><td>40,100</td><td>–</td><td>–</td><td>40,100</td></tr>
              <tr><td>Karewa</td><td>6,671</td><td>–</td><td>–</td><td>6,671</td></tr>
              <tr><td>Bhima Kaladgi</td><td>14,100</td><td>–</td><td>–</td><td>14,100</td></tr>
              <tr><td>Bastar</td><td>5,360</td><td>–</td><td>–</td><td>5,360</td></tr>
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

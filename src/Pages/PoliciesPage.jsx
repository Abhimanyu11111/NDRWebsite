import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../Component/Styles/policy.css";

const PoliciesPage = () => {
  return (
    <>
      <Header />

      <div className="conainer">

        <div className="policy-container">
        <div className="policy-card">
          <ol className="policy-list">
            <li>
              <strong>New domestic Natural Gas Pricing Guidelines:</strong> As part
              of pricing reforms for the natural gas sector, the government
              approved a new pricing scheme to further align domestic prices with
              international market prices and to raise investment for the sector.
              The same was notified on 18.10.2014 with a revision cycle of every
              six months based on the prevailing hub prices of United States,
              Alberta, United Kingdom and Russia. The price determined under this
              policy shall be applicable to all sectors uniformly. Further, under
              this policy government has decided to offer a premium on the gas to
              be produced from Deep-water areas, Ultra deep water areas and High
              Pressure High Temperature (HPHT) areas.
            </li>

            <li>
              <strong>
                Policy Framework for Relaxations, Extensions and clarifications at
                the Development and Production stage under PSC regime for early
                Monetisation of hydrocarbon discoveries:
              </strong>
              <ul className="nested-list">
                <li>
                  Under this policy 30 long pending issues have been resolved
                  since the commencement of the policy.
                </li>
                <li>
                  The decision taken in accordance with policy will further help
                  in drilling appraisal wells after submission of DoC in five
                  blocks. This will also help in probing additional reservoir
                  extent and submission of robust field development plan in three
                  blocks.
                </li>
                <li>
                  There were 12 blocks where clearances were not accorded in
                  entire block area or in part of block area because of
                  overlapping with special economic zone, reserve forest, naval
                  exercise area, DRDO danger zone, national parks and firing range
                  of Defence. The cases in 11 blocks have been resolved and the
                  case in one block is under consideration.
                </li>
                <li>
                  The policy framework has also helped in taking technical
                  decisions based in merits for swapping of 2D seismic work
                  program with 3D seismic work program and vice-versa in five
                  blocks.
                </li>
              </ul>
            </li>

            <li>
              <strong>Site Restoration Guidelines on petroleum operations:</strong>{" "}
              Government of India has constituted a committee for formulation of
              Site Restoration guidelines for petroleum operations. The committee
              met four times and shared their learning and experiences with
              respect to Field abandonment and Site Restoration. An
              internationally reputed consultant has been hired. The consultant
              has submitted draft report, which was reviewed by the committee
              members.
            </li>

            <li>
              <strong>
                Standing Committee on Petroleum Industry Practices:
              </strong>{" "}
              Government of India has constituted Standing Committee on Petroleum
              Industry Practices, to identify the areas requiring codification of
              “Good International Petroleum Industry Practices (GIPIP)” and to
              prepare national codes for petroleum operations. An internationally
              reputed consultant has been hired. The consultant has submitted the
              interim reports and comments of the Standing Committee members have
              been offered to the consultant for suitably modifying the reports.
            </li>

            <li>
              <strong>Uniform Licensing Policy:</strong> Government of India is
              considering Uniform Licensing Policy (ULP) to facilitate exploration
              and exploitation of both conventional and unconventional hydrocarbon
              resources together, in an awarded block
            </li>

            <li>
              <strong>E&P Data Policy:</strong> E&P Data policy is for E&P data
              assimilation, disclosure, sharing, accessibility and dissemination
              through NATIONAL DATA REPOSITORY(NDR){" "}
              <a href="/DownloadDataPriceListPolicies" className="policy-link">
                E&P Data Policy
              </a>
            </li>

            <li>
              <strong>Data Submission Guidelines:</strong>{" "}
              <a href="/DownloadDataPriceListPolicies" className="policy-link">
                Data Submission Guidelines
              </a>
            </li>
          </ol>
        </div>
      </div>

      </div>

      

      <Footer />
    </>
  );
};

export default PoliciesPage;

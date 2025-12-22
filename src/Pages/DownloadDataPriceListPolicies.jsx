import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/DownloadDataPriceListPolicies.module.css";

const DownloadDataPriceListPolicies = () => {
  return (
    <>
      <Header />

      <div className="container">

        <div className={styles.pageWrapper}>
        <h1 className={styles.title}>Policy Documents and Guidelines</h1>

        <ul className={styles.list}>

          <li>
            Please refer to the data pricing list for the data available for sale through NDR portal 
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/Price_List_for_NDR_Data_Sale-Final.pdf" className={styles.link}> NDR Data Sharing Rates </a>
          </li>

          <li>
            Please refer to the refund and cancellation policy for the data ordered through NDR portal  
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/Refund_and_cancellation_policy.pdf" className={styles.link}> Refund & Cancellation Policy </a>
          </li>

          <li>
            E&P Data policy is for E&P data assimilation, disclosure, sharing, accessibility and dissemination through NATIONAL DATA REPOSITORY (NDR)  
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/data_policy.pdf" className={styles.link}> E&P Data Policy </a>
          </li>

          <li>
            Confidentiality agreement is required to be filled out, signed and a soft copy is to be sent to indr@dghindia.gov.in for data purchase only  
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/confidentiality_agreement.pdf" className={styles.link}> Download Confidentiality Agreement </a>
          </li>

          <li>
            Indian Cyber Crime Coordination Centre (I4C) under Cyber & Information Security (CIS) Division of the Ministry of Home Affairs, has prepared a basic manual to disseminate Cyber Hygiene Best Practices for the benefit of Industrial Bodies/General Public/Government Officials. This should not be considered as an exhaustive list of precautions for Cyber Hygiene but baseline precautions that are to be taken. Go through attached handbooks for your knowledge and safety not only at workplace but for your personal cyber security also.:  
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/Cyber-security-best-practices_ENGLISH.pdf" className={styles.link}> Cyber-Security Handbook – ENGLISH </a>  
            &  
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/Cyber-security-best-practices_HINDI.pdf" className={styles.link}> Cyber-Security Handbook – HINDI </a>
          </li>

          <li>
            Latest Revised Guidelines for submission of E&P data of Nomination Fields by National Oil Companies (NOCs) to National Data Repository (NDR):  
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/Revised-DataSubmissionGuidelines.pdf" className={styles.link}> Revised Data Submission Guidelines </a>
          </li>

          <li>
           Old Guidelines for submission of E&P data of Nomination Fields by National Oil Companies (NOCs) to National Data Repository (NDR):  
            <a href="https://www.ndrdgh.gov.in/NDR/pdf/DataSubmissionGuidelines.pdf" className={styles.link}> Old Data Submission Guidelines </a>
          </li>

          <li>
            Microsoft Silverlight tool is required for India Online Exploration GIS map, download it from  
            <a href="#" className={styles.link}> Silverlight Download </a>
          </li>

        </ul>
      </div>

      </div>

      

      <Footer />
    </>
  );
};

export default DownloadDataPriceListPolicies;

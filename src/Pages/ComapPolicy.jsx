import React from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import styles from "../Component/Styles/ComapPolicy.module.css";
import HeaderWrapper from "../Component/HeaderWrapper";


const ComapPolicy = () => {
  return (
    <>
      <HeaderWrapper />

      <main className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>
            Content Ownership, Moderation & Approval Policy (COMAP)
          </h2>

          <p className={styles.text}>
            The content to be published on the website is contributed by the
            NDR’s domain department in a consistent fashion to maintain
            uniformity and to bring in standardisation. In order to present the
            content as per the requirement of the viewer, the content is
            categorised and to retrieve the relevant content efficiently, and
            the content is contributed to the website through a Content
            Management System which is web-based having user-friendly interface.
            Once the content is contributed it is approved and moderated prior
            to being published on the Website. The moderation could be
            multilevel and is role based. If the content is rejected at any
            level then it is reverted back to the originator of the content for
            modification.
          </p>

          <p className={styles.text}>
            Each of the links available in the website and the Sections/Officers
            which are responsible for the Content Ownership, Moderation and
            Approval are enumerated in the matrix given below:
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Content Element</th>
                  <th>Moderator</th>
                  <th>Approver</th>
                  <th>Contributor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>About NDR</td>
                  <td>NDR Website Team</td>
                  <td>HoD-NDR</td>
                  <td>NDR’s Office</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Policies &amp; Guidelines</td>
                  <td>NDR Website Team</td>
                  <td>DG’s Office</td>
                  <td>Content Manager</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>What’s New</td>
                  <td>NDR Website Team</td>
                  <td>HoD-NDR</td>
                  <td>Respective Department</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Contact Details</td>
                  <td>NDR Website Team</td>
                  <td>HoD-NDR</td>
                  <td>NDR’s Office</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ComapPolicy;

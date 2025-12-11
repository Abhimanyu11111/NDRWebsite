import React from "react";
import styles from "../Component/Styles/NewsSection.module.css";

export default function NewsSection() {
  // static data (hard-coded)
  const mapsLink = "#";
  const articles = [
    {
      title:
        "Seismic-Sequence Stratigraphy and Paleo-Structure Analysis of Proterozoic Sediment within Ganga Basin, India",
      href: "#",
    },
    {
      title:
        "Prediction of Facies & Reservoir Properties in Carbonate Reservoir through Geo-body Modelling: Mumbai Offshore Case Study",
      href: "#",
    },
    {
      title:
        "Application of paleo-structural and seismic sequence stratigraphy analysis to determine potential plays within the Proterozoic sequence of the Ganga Basin, India",
      href: "#",
    },
  ];
  const events = [
    {
      title:
        "New 2D Seismic Data acquired under EEZ Survey campaign (2023-2024) covering 79,539 LKM are available in NDR",
      href: "#",
    },
    {
      title:
        "Revised & updated data submission guideline is uploaded and can be downloaded through download section.",
      href: "#",
    },
  ];

  return (
    <section className={styles.wrapper} aria-labelledby="news-title">

        <div className="container">
  <div className={styles.innerGrid}>
        {/* LEFT: Maps + Articles */}
        <div className={styles.leftColumn}>
          <div className={styles.card} role="region" aria-label="Maps and Statistics">
            <div className={styles.cardHeader}>
              <span className={styles.icon} aria-hidden>
                🗺️
              </span>
              <h3 className={styles.cardTitle}>Map &amp; Statistics</h3>
            </div>
            <a className={styles.mapsLink} href={mapsLink}>
              Maps and Statistics →
            </a>
          </div>

          <div className={styles.card} role="region" aria-label="Technical Articles">
            <div className={styles.cardHeader}>
              <span className={styles.icon} aria-hidden>
                📘
              </span>
              <h3 className={styles.cardTitle}>Technical Articles</h3>
            </div>

            <ul className={styles.articleList}>
              {articles.map((a, i) => (
                <li key={i} className={styles.articleItem}>
                  <a href={a.href} className={styles.articleLink}>
                    {a.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: What's New */}
        <div className={styles.rightColumn} role="region" aria-labelledby="news-title">
          <h2 id="news-title" className={styles.rightTitle}>
            🔔 What's new &amp; Upcoming Events
          </h2>

          <ul className={styles.eventList}>
            {events.map((e, i) => (
              <li key={i} className={styles.eventItem}>
                <span className={styles.bullet} aria-hidden>
                  •
                </span>
                <a className={styles.eventLink} href={e.href}>
                  {e.title}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <a className={styles.viewAllBtn} href="#/events">
              View All
              <span className={styles.chev} aria-hidden>
                ›
              </span>
            </a>
          </div>
        </div>
      </div>
        </div>
    
    </section>
  );
}
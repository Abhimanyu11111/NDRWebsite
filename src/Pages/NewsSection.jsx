import React from "react";
import styles from "../Component/Styles/NewsSection.module.css";
import artille from "../assets/Images/stats/araticle.svg";
import map from "../assets/Images/stats/map.svg";
import noti from "../assets/Images/stats/noti.svg";
import mapi from "../assets/Images/stats/india.png"

export default function NewsSection() {

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

     {
      title:
        "Illumination of Subsurface Geological Elements using New Seismic Data in the East of Andaman Basin with Promising Prospects for Oil and Gas Exploration",
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
        {/* <div className={styles.innerGrid}>
         
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

            <div className={styles.card2} role="region" aria-label="Technical Articles">
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
        </div> */}








        <div className={styles.innerGrid}>

          <div className={styles.rightColumn} role="region" aria-labelledby="news-title">
            <div style={{ display: "flex", gap: "0px 10px", alignItems: "center", }} >
              <div>
                <img src={artille} alt="" />

              </div>
              <h2 id="news-title" className={styles.rightTitle}>

                <span>What's new &amp; Upcoming Events</span>
              </h2>

            </div>




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

            {/* <div className={styles.actions}>
              <a className={styles.viewAllBtn} href="#/events">
                View All
                <span className={styles.chev} aria-hidden>
                  ›
                </span>
              </a>
            </div> */}
          </div>



          {/* <div className={styles.leftColumn}> */}


          <div className={styles.card} role="region" aria-label="Maps and Statistics">
            <div style={{ display: "flex", alignItems: "center", gap: "0px 10px" }} className={styles.cardHeader}>
              <div className={styles.icon} aria-hidden>
                <img src={map} alt="" />
              </div>
              <h3 className={styles.cardTitle}>Map &amp; Statistics</h3>




            </div>
            {/* <a className={styles.mapsLink} href={mapsLink}>
              Maps and Statistics →
            </a> */}



            {/* <div style={{width : "12rem" , margin : "0px auto"}}>
                <img style={{width : "100%"}} src={mapi} alt="" />
              </div> */}

            <div style={{ width: "90%", height: "19rem", borderRadius: "5px", margin: "0px auto" , display : "flex" , justifyContent : "center" }}>

              <img style={{ width: "81%" }} src={mapi} alt="" />
            </div>


            <div style={{ display: "flex", justifyContent: "center" }}>
              <a className={styles.viewAllBtn} href="#/events">
                Maps and Statistics
                <span className={styles.chev} aria-hidden>
                  ›
                </span>
              </a>
            </div>

          </div>

          <div className={styles.card2} role="region" aria-label="Technical Articles">
            <div style={{ display: "flex", alignItems: "center", gap: "0px 10px" }} className={styles.cardHeader}>
              <div className={styles.icon} aria-hidden>
                <img src={noti} alt="" />
              </div>
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


          {/* </div> */}
        </div>
      </div>

    </section>
  );
}






// import React from 'react';

// export default function NewsSection() {
//   return (
//     <div className="wrap">
//       <style>{`
//         :root {
//   --card-bg: #ffffff;
//   --muted: #6b7280;
//   --accent: #6c4cff;
//   --border: rgba(15, 23, 42, 0.06);
//   --soft: rgba(99, 102, 241, 0.06);
// }

// * {
//   box-sizing: border-box;
// }

// body,
// html,
// #root {
//   height: 100%;
// }

// .wrap {
//   font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
//     Roboto, "Helvetica Neue", Arial;
//   padding: 24px;
//   background: #f7fafc;
//   min-height: 100vh;
//   color: #0f172a;
// }

// .grid {
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   gap: 24px;
//   max-width: 1280px;
//   margin: 0 auto;
// }

// /* card */
// .card {
//   background: var(--card-bg);
//   border-radius: 12px;
//   padding: 22px;
//   border: 1px solid var(--border);
//   box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
//   min-height: 420px;
//   display: flex;
//   flex-direction: column;
//   justify-content: flex-start;
// }

// .card-header {
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   margin-bottom: 18px;
// }

// .icon-box {
//   width: 40px;
//   height: 40px;
//   border-radius: 8px;
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   background: #eef2ff;
// }

// .card-title {
//   font-size: 20px;
//   font-weight: 600;
// }

// /* left list */
// .list {
//   display: flex;
//   flex-direction: column;
//   gap: 18px;
//   flex: 1;
// }

// .article {
//   color: #4f46e5;
//   font-weight: 500;
//   text-decoration: none;
//   font-size: 15px;
// }

// .meta {
//   color: var(--muted);
//   font-size: 13px;
//   margin-top: 6px;
// }

// .view-all {
//   margin-top: auto;
//   color: #ff7a00;
//   font-weight: 600;
//   display: inline-flex;
//   gap: 8px;
//   align-items: center;
// }

// /* center map */
// .map-box {
//   background: linear-gradient(180deg, #effaf8, #fff);
//   border-radius: 10px;
//   padding: 28px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   min-height: 180px;
//   box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.03);
// }

// .map-cta {
//   font-size: 15px;
//   color: #0f172a;
//   margin-top: 12px;
// }

// .stats {
//   display: flex;
//   gap: 14px;
//   margin-top: 18px;
//   align-items: stretch;
// }

// .stat {
//   flex: 1;
//   padding: 14px;
//   border-radius: 10px;
//   display: flex;
//   flex-direction: column;
//   gap: 6px;
//   align-items: flex-start;
// }

// .stat.orange {
//   background: linear-gradient(180deg, #fff6f0, #fff);
//   border: 1px solid rgba(249, 115, 22, 0.08);
// }

// .stat.blue {
//   background: linear-gradient(180deg, #f0f6ff, #fff);
//   border: 1px solid rgba(59, 130, 246, 0.06);
// }

// .stat .label {
//   font-size: 13px;
//   color: #92400e;
// }

// .stat .value {
//   font-size: 24px;
//   font-weight: 700;
// }

// .maps-link {
//   margin-top: 18px;
//   color: #4f46e5;
//   font-weight: 600;
//   display: inline-flex;
//   gap: 8px;
//   align-items: center;
// }

// /* right events */
// .events-list {
//   display: flex;
//   flex-direction: column;
//   gap: 14px;
//   flex: 1;
// }

// .event-item {
//   display: flex;
//   gap: 12px;
//   align-items: flex-start;
// }

// .dot {
//   width: 6px;
//   height: 6px;
//   background: #4f46e5;
//   border-radius: 50%;
//   margin-top: 8px;
// }

// .event-body {
//   flex: 1;
// }

// .event-title {
//   font-size: 15px;
//   color: #0f172a;
// }

// .tag {
//   display: inline-block;
//   background: #eef2ff;
//   color: #4338ca;
//   padding: 6px 8px;
//   border-radius: 6px;
//   font-size: 12px;
//   margin-top: 8px;
// }

// .date {
//   color: var(--muted);
//   font-size: 13px;
//   margin-left: 10px;
// }

// .view-all-right {
//   margin-top: auto;
//   color: #ff7a00;
//   font-weight: 600;
// }

// /* responsive */
// @media (max-width: 1000px) {
//   .grid {
//     grid-template-columns: 1fr;
//   }

//   .card {
//     min-height: 320px;
//   }
// }

//       `}</style>

//       <div className="grid">
//         {/* left card */}
//         <section className="card">
//           <div className="card-header">
//             <div className="icon-box">
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 7h10v10H7z" stroke="#4338ca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//             </div>
//             <div className="card-title">Technical articles</div>
//           </div>

//           <div className="list">
//             <a className="article" href="#">Seismic sequence stratigraphy and paleo-structure analysis of proterozoic sediment within ganga basin, india</a>
//             <div className="meta">December 2024</div>

//             <a className="article" href="#">Prediction of facies & reservoir properties in carbonate reservoir through geo-body modelling: mumbai offshore case study</a>
//             <div className="meta">November 2024</div>

//             <a className="article" href="#">Application of paleo-structural and seismic sequence stratigraphy analysis to determine potential plays within the proterozoic sequence of the ganga basin, india</a>
//             <div className="meta">October 2024</div>

//             <a className="article" href="#">Advanced machine learning techniques for subsurface characterization in deep water environments</a>
//             <div className="meta">September 2024</div>

//             <div className="view-all">View all articles <svg width="14" height="14" viewBox="0 0 24 24" style={{marginLeft:8}}><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="#ff7a00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
//           </div>
//         </section>

//         {/* center card */}
//         <section className="card">
//           <div className="card-header">
//             <div className="icon-box" style={{background:'#ecfdf5'}}>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6l7-4 7 4 4-2v14l-4 2-7-4-7 4V6z" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
//             </div>
//             <div className="card-title">Map & statistics</div>
//           </div>

//           <div className="map-box">
//             <svg width="72" height="72" viewBox="0 0 24 24" fill="none"><path d="M3 6l7-4 7 4 4-2v14l-4 2-7-4-7 4V6z" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
//             <div className="map-cta">Interactive basin map</div>
//             <div style={{color:'var(--muted)', fontSize:13, marginTop:6}}>Explore sedimentary basins across india</div>
//           </div>

//           <div className="stats">
//             <div className="stat orange">
//               <div className="label">Data volume</div>
//               <div className="value">X-TB</div>
//               <div className="meta" style={{color:'#92400e'}}>Total repository</div>
//             </div>
//             <div className="stat blue">
//               <div className="label">Coverage</div>
//               <div className="value">26</div>
//               <div className="meta" style={{color:'#1e3a8a'}}>Basins mapped</div>
//             </div>
//           </div>

//           <div className="maps-link">Maps and statistics <svg width="14" height="14" viewBox="0 0 24 24" style={{marginLeft:8}}><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
//         </section>

//         {/* right card */}
//         <section className="card">
//           <div className="card-header">
//             <div className="icon-box" style={{background:'#fff6e6'}}>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3" stroke="#92400e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
//             </div>
//             <div className="card-title">What's new & upcoming events</div>
//           </div>

//           <div className="events-list">
//             <div style={{background:'#fffbeb', borderRadius:8, padding:12, border:'1px solid rgba(249,115,22,0.06)'}}>
//               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
//                 <div style={{fontSize:14}}>New 2D seismic data acquired under EEZ survey campaign (2023-2024) covering 79,539 lkm are available in NDR</div>
//               </div>
//               <div style={{marginTop:8, display:'flex', gap:10, alignItems:'center'}}>
//                 <div className="tag" style={{background:'#eef2ff', color:'#4338ca'}}>Data release</div>
//                 <div className="date">December 15, 2024</div>
//               </div>
//             </div>

//             <div className="event-item">
//               <div className="dot" />
//               <div className="event-body">
//                 <div className="event-title">Revised & updated data submission guideline is uploaded and can be downloaded through download section</div>
//                 <div style={{marginTop:8}}>
//                   <span className="tag">Update</span>
//                   <span className="date">December 10, 2024</span>
//                 </div>
//               </div>
//             </div>

//             <div className="event-item">
//               <div className="dot" />
//               <div className="event-body">
//                 <div className="event-title">Webinar: advanced seismic interpretation techniques</div>
//                 <div style={{marginTop:8}}>
//                   <span className="tag">Event</span>
//                   <span className="date">December 20, 2024</span>
//                 </div>
//               </div>
//             </div>

//             <div className="event-item">
//               <div className="dot" />
//               <div className="event-body">
//                 <div className="event-title">New geochemical analysis reports for krishna-godavari basin now available</div>
//                 <div style={{marginTop:8}}>
//                   <span className="tag">Data release</span>
//                   <span className="date">December 8, 2024</span>
//                 </div>
//               </div>
//             </div>

//             <div className="view-all-right">View all</div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

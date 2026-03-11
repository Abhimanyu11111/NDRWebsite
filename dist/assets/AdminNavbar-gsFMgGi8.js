import{r as h,j as e,L as r}from"./index-CfhsyVHk.js";import{g as x}from"./emblem1-C8uxd8xB.js";import{c as a}from"./createLucideIcon-h3dIB4Vp.js";import{U as y}from"./user-BhsOoxz3.js";const g=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],m=a("calendar",g);const u=[["path",{d:"M10 22v-6.57",key:"1wmca3"}],["path",{d:"M12 11h.01",key:"z322tv"}],["path",{d:"M12 7h.01",key:"1ivr5q"}],["path",{d:"M14 15.43V22",key:"1q2vjd"}],["path",{d:"M15 16a5 5 0 0 0-6 0",key:"o9wqvi"}],["path",{d:"M16 11h.01",key:"xkw8gn"}],["path",{d:"M16 7h.01",key:"1kdx03"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 7h.01",key:"1vti4s"}],["rect",{x:"4",y:"2",width:"16",height:"20",rx:"2",key:"1uxh74"}]],b=a("hotel",u);const v=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],f=a("layout-dashboard",v);const k=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],j=a("menu",k);const w=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],M=a("users",w);const C=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],S=a("x",C);function K(){const[n,p]=h.useState(window.location.pathname),[o,c]=h.useState(!1),l=[{path:"/admin/dashboard",label:"Dashboard",icon:f},{path:"/admin/manageusers",label:"Manage Users",icon:M},{path:"/admin/managedata",label:"Manage Data",icon:b},{path:"/admin/managebookings",label:"Manage Bookings",icon:m}];return e.jsxs("nav",{style:I,children:[e.jsxs("div",{style:N,children:[e.jsxs(r,{to:"/admin/dashboard",style:z,children:[e.jsx("img",{src:x,alt:"Logo",style:D}),e.jsxs("div",{style:L,children:[e.jsx("span",{style:_,children:"NDR (National Data Repository)"}),e.jsx("span",{style:R,children:"Management Portal"})]})]}),e.jsx("div",{style:A,children:l.map(t=>{const i=t.icon;return e.jsxs(r,{to:t.path,style:{...W,...n===t.path?q:{}},onClick:()=>p(t.path),onMouseEnter:s=>{n!==t.path&&(s.currentTarget.style.backgroundColor="rgba(255,255,255,0.15)")},onMouseLeave:s=>{n!==t.path&&(s.currentTarget.style.backgroundColor="transparent")},children:[e.jsx(i,{size:18,strokeWidth:2.5}),t.label]},t.path)})}),e.jsx("div",{style:E,children:e.jsxs("div",{style:T,children:[e.jsx("div",{style:U,children:e.jsx(y,{size:20,strokeWidth:2.5})}),e.jsxs("div",{style:$,children:[e.jsx("span",{style:H,children:"Admin"}),e.jsx("span",{style:B,children:"Administrator"})]})]})}),e.jsx("button",{style:O,onClick:()=>c(!o),children:o?e.jsx(S,{size:24}):e.jsx(j,{size:24})})]}),o&&e.jsx("div",{style:Y,children:l.map(t=>{const i=t.icon;return e.jsxs(r,{to:t.path,style:{...F,...n===t.path?P:{}},onClick:()=>{p(t.path),c(!1)},children:[e.jsx(i,{size:20,strokeWidth:2.5}),t.label]},t.path)})})]})}const I={background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",position:"sticky",top:0,zIndex:100},N={maxWidth:"1600px",margin:"0 auto",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"32px"},z={display:"flex",alignItems:"center",gap:"12px",textDecoration:"none",color:"white",flexShrink:0},D={width:"34px",height:"48px",borderRadius:"12px",objectFit:"cover",boxShadow:"0 4px 8px rgba(0,0,0,0.2)"},L={display:"flex",flexDirection:"column",gap:"2px"},_={fontSize:"20px",fontWeight:"700",letterSpacing:"-0.5px"},R={fontSize:"12px",opacity:.9,fontWeight:"500"},A={display:"flex",gap:"8px",flex:1,justifyContent:"center"},W={display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",color:"white",textDecoration:"none",fontSize:"15px",fontWeight:"600",borderRadius:"10px",transition:"all 0.3s ease",whiteSpace:"nowrap"},q={backgroundColor:"rgba(255,255,255,0.25)",boxShadow:"0 4px 8px rgba(0,0,0,0.1)"},E={display:"flex",alignItems:"center",gap:"12px",flexShrink:0},T={display:"flex",alignItems:"center",gap:"12px",padding:"8px 16px",backgroundColor:"rgba(255,255,255,0.15)",borderRadius:"12px",cursor:"pointer",transition:"all 0.3s ease"},U={width:"36px",height:"36px",borderRadius:"10px",backgroundColor:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",color:"white"},$={display:"flex",flexDirection:"column",gap:"2px"},H={fontSize:"14px",fontWeight:"700",color:"white"},B={fontSize:"12px",opacity:.9,color:"white"},O={display:"none",fontSize:"24px",background:"rgba(255,255,255,0.15)",border:"none",color:"white",cursor:"pointer",padding:"8px 12px",borderRadius:"8px",transition:"all 0.3s ease",alignItems:"center",justifyContent:"center"},Y={display:"none",flexDirection:"column",gap:"4px",padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.15)",animation:"slideDown 0.3s ease"},F={display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",color:"white",textDecoration:"none",fontSize:"15px",fontWeight:"600",borderRadius:"8px",transition:"all 0.3s ease"},P={backgroundColor:"rgba(255,255,255,0.25)"},d=document.createElement("style");d.textContent=`
@media (max-width: 968px) {
  nav > div:first-child > div:nth-child(2) {
    display: none !important;
  }
  nav > div:first-child > div:nth-child(3) {
    display: none !important;
  }
  nav > div:first-child > button {
    display: flex !important;
  }
  nav > div:last-child {
    display: flex !important;
  }
}

@media (max-width: 640px) {
  nav > div:first-child > a > div {
    display: none !important;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;document.head.querySelector("style[data-admin-navbar]")||(d.setAttribute("data-admin-navbar","true"),document.head.appendChild(d));export{K as A,m as C,b as H,M as U,S as X};

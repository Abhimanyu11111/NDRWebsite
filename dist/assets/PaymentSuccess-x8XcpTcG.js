import{j as e}from"./index-DwDwpMMK.js";function l(){const a=`TXN${Math.random().toString(36).substr(2,9).toUpperCase()}`,s=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),n=()=>{const t=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #16a34a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 10px;
          }
          .govt-name {
            font-size: 20px;
            color: #666;
          }
          .receipt-title {
            background-color: #16a34a;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
          }
          .details-section {
            margin-bottom: 30px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-label {
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            font-weight: 700;
            color: #111;
          }
          .amount-section {
            background-color: #f0fdf4;
            border: 2px solid #16a34a;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
          }
          .amount-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #16a34a;
          }
          .status-badge {
            display: inline-block;
            background-color: #dcfce7;
            color: #16a34a;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature-section {
            margin-top: 50px;
            text-align: right;
          }
          .signature-line {
            border-top: 2px solid #333;
            width: 200px;
            margin-left: auto;
            margin-top: 60px;
            padding-top: 10px;
            text-align: center;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🇮🇳 GOVERNMENT PORTAL</div>
          <div class="govt-name">Ministry of Digital Services</div>
        </div>

        <div class="receipt-title">
          PAYMENT RECEIPT
        </div>

        <div class="details-section">
          <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value">${a}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time:</span>
            <span class="detail-value">${s}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">Net Banking</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Status:</span>
            <span class="detail-value"><span class="status-badge">✓ SUCCESS</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Service Name:</span>
            <span class="detail-value">Government Service Fee</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Beneficiary Name:</span>
            <span class="detail-value">John Doe</span>
          </div>
        </div>

        <div class="amount-section">
          <div class="amount-label">Total Amount Paid</div>
          <div class="amount-value">₹ 1,500.00</div>
        </div>

        <div class="details-section">
          <h3 style="color: #16a34a; margin-bottom: 15px;">Payment Breakdown:</h3>
          <div class="detail-row">
            <span class="detail-label">Service Fee:</span>
            <span class="detail-value">₹ 1,200.00</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Processing Fee:</span>
            <span class="detail-value">₹ 200.00</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">GST (18%):</span>
            <span class="detail-value">₹ 100.00</span>
          </div>
          <div class="detail-row" style="background-color: #f3f4f6; font-size: 18px;">
            <span class="detail-label">Total:</span>
            <span class="detail-value">₹ 1,500.00</span>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-line">
            Authorized Signature
          </div>
        </div>

        <div class="footer">
          <p><strong>Note:</strong> This is a computer-generated receipt and does not require a physical signature.</p>
          <p>For any queries, please contact: support@gov.in | 1800-XXX-XXXX</p>
          <p style="margin-top: 20px;">Generated on: ${new Date().toLocaleString("en-IN")}</p>
        </div>
      </body>
      </html>
    `,o=window.open("","_blank");o.document.write(t),o.document.close(),o.onload=function(){o.print()}};return e.jsxs("div",{style:{minHeight:"100vh",background:"linear-gradient(to bottom right, #f0fdf4, #ffffff, #ecfdf5)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"},children:[e.jsxs("div",{style:{maxWidth:"672px",width:"100%"},children:[e.jsxs("div",{style:{backgroundColor:"white",borderRadius:"8px",boxShadow:"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",border:"1px solid #dcfce7",padding:"48px"},children:[e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:"24px"},children:e.jsx("div",{style:{width:"96px",height:"96px",backgroundColor:"#dcfce7",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",animation:"pulse 2s ease-in-out infinite"},children:e.jsxs("svg",{style:{width:"64px",height:"64px",color:"#16a34a"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",strokeWidth:"2"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M9 12l2 2 4-4"})]})})}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"32px"},children:[e.jsx("h1",{style:{fontSize:"36px",fontWeight:"bold",color:"#111827",marginBottom:"12px"},children:"Payment Successful!"}),e.jsx("p",{style:{fontSize:"18px",color:"#4b5563"},children:"Your transaction has been completed successfully."})]}),e.jsxs("div",{style:{backgroundColor:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"8px",padding:"24px",marginBottom:"32px"},children:[e.jsx("h2",{style:{fontWeight:"600",color:"#111827",marginBottom:"16px",fontSize:"18px"},children:"Transaction Details:"}),e.jsxs("div",{style:{color:"#374151"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #d1fae5"},children:[e.jsx("span",{style:{fontWeight:"500"},children:"Transaction ID:"}),e.jsx("span",{style:{fontWeight:"600",color:"#16a34a"},children:a})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #d1fae5"},children:[e.jsx("span",{style:{fontWeight:"500"},children:"Date & Time:"}),e.jsx("span",{style:{fontWeight:"600"},children:s})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #d1fae5"},children:[e.jsx("span",{style:{fontWeight:"500"},children:"Payment Method:"}),e.jsx("span",{style:{fontWeight:"600"},children:"Net Banking"})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",padding:"12px 0"},children:[e.jsx("span",{style:{fontWeight:"500"},children:"Status:"}),e.jsx("span",{style:{fontWeight:"600",color:"#16a34a",backgroundColor:"#dcfce7",padding:"4px 12px",borderRadius:"12px",fontSize:"14px"},children:"✓ Completed"})]})]})]}),e.jsxs("div",{style:{backgroundColor:"#dbeafe",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"16px",marginBottom:"32px",display:"flex",gap:"12px"},children:[e.jsx("svg",{style:{width:"24px",height:"24px",color:"#2563eb",flexShrink:0},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),e.jsx("p",{style:{color:"#1e40af",fontSize:"14px",margin:0},children:"A confirmation email has been sent to your registered email address. Please save this transaction ID for future reference."})]}),e.jsxs("div",{style:{marginBottom:"32px"},children:[e.jsxs("button",{onClick:n,style:{width:"100%",backgroundColor:"#16a34a",color:"white",fontWeight:"600",padding:"12px 24px",borderRadius:"8px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",marginBottom:"16px",transition:"background-color 0.2s"},onMouseOver:t=>t.target.style.backgroundColor="#15803d",onMouseOut:t=>t.target.style.backgroundColor="#16a34a",children:[e.jsx("svg",{style:{width:"20px",height:"20px"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Download Receipt"]}),e.jsxs("button",{style:{width:"100%",backgroundColor:"#f3f4f6",color:"#374151",fontWeight:"600",padding:"12px 24px",borderRadius:"8px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"background-color 0.2s"},onMouseOver:t=>t.target.style.backgroundColor="#e5e7eb",onMouseOut:t=>t.target.style.backgroundColor="#f3f4f6",children:[e.jsx("svg",{style:{width:"20px",height:"20px"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"})}),"Return to Homepage"]})]}),e.jsxs("div",{style:{borderTop:"1px solid #e5e7eb",paddingTop:"24px"},children:[e.jsx("p",{style:{textAlign:"center",color:"#4b5563",marginBottom:"16px",fontSize:"14px"},children:"Questions about your payment? Contact our support team"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",justifyContent:"center",alignItems:"center"},children:[e.jsxs("a",{href:"mailto:support@gov.in",style:{display:"flex",alignItems:"center",gap:"8px",color:"#2563eb",textDecoration:"none"},onMouseOver:t=>t.target.style.color="#1d4ed8",onMouseOut:t=>t.target.style.color="#2563eb",children:[e.jsx("svg",{style:{width:"20px",height:"20px"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"})}),e.jsx("span",{style:{fontWeight:"500"},children:"support@gov.in"})]}),e.jsxs("a",{href:"tel:1800-xxx-xxxx",style:{display:"flex",alignItems:"center",gap:"8px",color:"#2563eb",textDecoration:"none"},onMouseOver:t=>t.target.style.color="#1d4ed8",onMouseOut:t=>t.target.style.color="#2563eb",children:[e.jsx("svg",{style:{width:"20px",height:"20px"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"})}),e.jsx("span",{style:{fontWeight:"500"},children:"1800-XXX-XXXX"})]})]})]})]}),e.jsx("p",{style:{textAlign:"center",fontSize:"14px",color:"#6b7280",marginTop:"24px"},children:"Thank you for using our payment service. Keep this page for your records."})]}),e.jsx("style",{children:`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `})]})}export{l as default};

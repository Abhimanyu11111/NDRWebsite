import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "..", "public", "documents");
const outputFile = path.join(outputDir, "NDR-Help-User-Guide.pdf");

const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
const margin = 18;
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const contentWidth = pageWidth - margin * 2;
let y = 20;

const addPageHeader = () => {
  doc.setFillColor(20, 72, 142);
  doc.rect(0, 0, pageWidth, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("NATIONAL DATA REPOSITORY (NDR)", margin, 7.2);
  doc.setTextColor(31, 41, 55);
};

const ensureSpace = (requiredHeight) => {
  if (y + requiredHeight <= pageHeight - 17) return;
  doc.addPage();
  addPageHeader();
  y = 20;
};

const addParagraph = (text, { bold = false, size = 10, gap = 3 } = {}) => {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(48, 58, 72);
  const lines = doc.splitTextToSize(text, contentWidth);
  const height = lines.length * 5;
  ensureSpace(height + gap);
  doc.text(lines, margin, y);
  y += height + gap;
};

const addBullet = (text) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(text, contentWidth - 8);
  const height = lines.length * 4.7;
  ensureSpace(height + 2);
  doc.setFillColor(20, 72, 142);
  doc.circle(margin + 1.2, y - 1.1, 0.8, "F");
  doc.setTextColor(48, 58, 72);
  doc.text(lines, margin + 6, y);
  y += height + 2;
};

const addSection = (number, title, intro, bullets = []) => {
  ensureSpace(16);
  if (y > 25) y += 2;
  doc.setFillColor(232, 241, 252);
  doc.roundedRect(margin, y - 5.5, contentWidth, 10, 2, 2, "F");
  doc.setFillColor(20, 72, 142);
  doc.circle(margin + 5, y - 0.5, 3.4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(String(number), margin + 5, y + 0.5, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(20, 72, 142);
  doc.text(title, margin + 11, y + 0.4);
  y += 10;
  if (intro) addParagraph(intro, { size: 9.5, gap: 2 });
  bullets.forEach(addBullet);
};

addPageHeader();
doc.setFont("helvetica", "bold");
doc.setFontSize(23);
doc.setTextColor(20, 72, 142);
doc.text("Help & User Guide", margin, y + 3);
y += 13;
addParagraph(
  "This guide walks you through the key steps to use the National Data Repository (NDR) portal - from registration to login, password reset, academic registration and contact details.",
  { size: 10.5, gap: 5 },
);

addSection(
  1,
  "Registration",
  "National Data Repository (NDR) is a government-sponsored E&P data bank for preservation, upkeep and dissemination of data for exploration and development.",
  [
    "Users are requested to register themselves on the NDR portal to gain access to data.",
    "Registration is accepted only with official email IDs. Free or personal emails (Gmail, Yahoo, Outlook, etc.) are not accepted.",
    "Go to the NDR portal and click the Register button on the data tab.",
    "Fill in all mandatory fields (marked with *), including organisation details, contact details and other required information.",
    "Submit the registration form and wait for verification. Please allow 24 working hours for processing during office hours (Mon-Fri, 9:30 AM to 5:30 PM IST, excluding public holidays).",
    "After successful submission, a system-generated email will confirm that your registration request has been received.",
  ],
);

addSection(2, "Login", null, [
  "Once your registration is validated, you will receive login credentials for the NDR portal.",
  "Open the NDR portal and go to the Login tab in the top menu.",
  "Enter your registered email ID and password to access the data and tools available on the portal.",
  "After login, follow the help guidelines available inside the portal to explore datasets and features.",
]);

addSection(3, "Forgot / Reset Password", null, [
  "If you forget your password, go to the Login tab and click Forgot / Reset Password.",
  "Enter your registered email address and the captcha code.",
  "Submit the form to send a reset password request. Follow the instructions received by email to set a new password.",
]);

addSection(
  4,
  "Academic Registration Guidelines",
  "Academic users must submit additional documents for their registration request to be processed.",
  [
    "Send a scanned copy of your Student ID card.",
    "Send an authority letter on official letterhead from a competent authority (HOD, VC, etc.) with seal or stamp confirming legitimate use.",
    "Email these documents to indr@dghindia.gov.in using the official format specified in the guidelines.",
    "Registration processing for academic accounts starts only after receiving the above documents.",
  ],
);
addParagraph("Important instructions", { bold: true, size: 10, gap: 2 });
[
  "Only colour scanned copies of original documents are accepted.",
  "Student ID card file size should be less than 100 KB.",
  "Authority letter file size should be less than 500 KB.",
].forEach(addBullet);

addSection(
  5,
  "Contact Us",
  "For any queries or assistance regarding the NDR portal, use the following contact details.",
  [],
);
addParagraph("Address", { bold: true, size: 10, gap: 1 });
addParagraph(
  "National Data Repository, Directorate General of Hydrocarbons (DGH)\nMinistry of Petroleum and Natural Gas, Government of India\nOIDB Bhawan, Plot No. 2, Sector-73, Noida (UP), India - 201301",
  { size: 9.5, gap: 3 },
);
addParagraph("Email", { bold: true, size: 10, gap: 1 });
addParagraph("indr@dghindia.gov.in", { size: 9.5, gap: 3 });
addParagraph("Phone", { bold: true, size: 10, gap: 1 });
addParagraph(
  "+91-120-2472578 (HoD-NDR / Chief NDR)\n+91-120-2472551 (NDR Technical Support)\n+91-120-2472000 (DGH Reception)",
  { size: 9.5, gap: 3 },
);
addParagraph("Working Hours", { bold: true, size: 10, gap: 1 });
addParagraph(
  "Monday to Friday - 9:30 AM to 5:30 PM (UTC+05:30), except public holidays.",
  { size: 9.5, gap: 3 },
);
addParagraph(
  "You can also view the yearly holiday calendar from the NDR portal for more information.",
  { bold: true, size: 9, gap: 2 },
);

const pageCount = doc.getNumberOfPages();
for (let page = 1; page <= pageCount; page += 1) {
  doc.setPage(page);
  doc.setDrawColor(214, 222, 232);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(112, 124, 140);
  doc.text("National Data Repository | Help & User Guide", margin, pageHeight - 7);
  doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, Buffer.from(doc.output("arraybuffer")));
console.log(`Generated ${outputFile}`);

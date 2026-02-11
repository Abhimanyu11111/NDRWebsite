import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Hotel, 
  Calendar, 
  User, 
  Menu, 
  X 
} from "lucide-react";
import Emblem from "../assets/images/emblem1.png";

export default function AdminNavbar() {
  const [activeLink, setActiveLink] = useState(window.location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/manageusers", label: "Manage Users", icon: Users },
    { path: "/admin/managedata", label: "Manage Data", icon: Hotel },
    { path: "/admin/managebookings", label: "Manage Bookings", icon: Calendar }
  ];

  return (
    <nav style={navContainer}>
      <div style={navContent}>
        {/* Logo Section */}
        <Link to="/admin/dashboard" style={logoSection}>
          <img src={Emblem} alt="Logo" style={logoImage} />
          <div style={logoText}>
            <span style={brandName}>NDR (National Data Repository)</span>
            <span style={brandTagline}>Management Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={desktopNav}>
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...navLink,
                  ...(activeLink === link.path ? navLinkActive : {})
                }}
                onClick={() => setActiveLink(link.path)}
                onMouseEnter={(e) => {
                  if (activeLink !== link.path) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeLink !== link.path) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <IconComponent size={18} strokeWidth={2.5} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div style={userSection}>
          <div style={userInfo}>
            <div style={userAvatar}>
              <User size={20} strokeWidth={2.5} />
            </div>
            <div style={userDetails}>
              <span style={userName}>Admin</span>
              <span style={userRole}>Administrator</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          style={mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div style={mobileNav}>
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...mobileNavLink,
                  ...(activeLink === link.path ? mobileNavLinkActive : {})
                }}
                onClick={() => {
                  setActiveLink(link.path);
                  setIsMobileMenuOpen(false);
                }}
              >
                <IconComponent size={20} strokeWidth={2.5} />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

/* ================= STYLES ================= */

const navContainer = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const navContent = {
  maxWidth: "1600px",
  margin: "0 auto",
  padding: "16px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "32px"
};

const logoSection = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  textDecoration: "none",
  color: "white",
  flexShrink: 0
};

const logoImage = {
  width: "34px",
  height: "48px",
  borderRadius: "12px",
  objectFit: "cover",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
};

const logoText = {
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const brandName = {
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "-0.5px"
};

const brandTagline = {
  fontSize: "12px",
  opacity: 0.9,
  fontWeight: "500"
};

const desktopNav = {
  display: "flex",
  gap: "8px",
  flex: 1,
  justifyContent: "center"
};

const navLink = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 20px",
  color: "white",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "600",
  borderRadius: "10px",
  transition: "all 0.3s ease",
  whiteSpace: "nowrap"
};

const navLinkActive = {
  backgroundColor: "rgba(255,255,255,0.25)",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
};

const userSection = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexShrink: 0
};

const userInfo = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "8px 16px",
  backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.3s ease"
};

const userAvatar = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: "rgba(255,255,255,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white"
};

const userDetails = {
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const userName = {
  fontSize: "14px",
  fontWeight: "700",
  color: "white"
};

const userRole = {
  fontSize: "12px",
  opacity: 0.9,
  color: "white"
};

const mobileMenuButton = {
  display: "none",
  fontSize: "24px",
  background: "rgba(255,255,255,0.15)",
  border: "none",
  color: "white",
  cursor: "pointer",
  padding: "8px 12px",
  borderRadius: "8px",
  transition: "all 0.3s ease",
  alignItems: "center",
  justifyContent: "center"
};

const mobileNav = {
  display: "none",
  flexDirection: "column",
  gap: "4px",
  padding: "16px 24px",
  borderTop: "1px solid rgba(255,255,255,0.15)",
  animation: "slideDown 0.3s ease"
};

const mobileNavLink = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 16px",
  color: "white",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "600",
  borderRadius: "8px",
  transition: "all 0.3s ease"
};

const mobileNavLinkActive = {
  backgroundColor: "rgba(255,255,255,0.25)"
};

// Add this style tag to your component or global CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
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
`;

if (!document.head.querySelector('style[data-admin-navbar]')) {
  styleSheet.setAttribute('data-admin-navbar', 'true');
  document.head.appendChild(styleSheet);
}
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import StyleSheet from "../Component/Styles/HeaderWrapper.module.css";


function HeaderWrapper() {
  return (
    <>
      <div className={StyleSheet.desktopNav}>
       <Header />
      </div>

      <div className={StyleSheet.mobileNav}>
       <MobileHeader/>
      </div>
    </>
  );
}

export default HeaderWrapper;

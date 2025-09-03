// Sidebar.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pinIcon from '../../assets/pin-on-map.png';
import robotIcon from '../../assets/ai-robot.png';
import photosIcon from '../../assets/photos-placeholder.png';
import medalIcon from '../../assets/Achievement.png';
import sidebarMountains from '../../assets/sidebar-mountains.png';
import pinSvg from '../../assets/pin-sharp-circle-625-svgrepo-com.svg';
import robotSvg from '../../assets/robot-svgrepo-com.svg';
import photosSvg from '../../assets/photos-svgrepo-com.svg';
import friendsSvg from '../../assets/circled-group-svgrepo-com.svg';
import medalSvg from '../../assets/medal-svgrepo-com.svg';
import { FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import { FaListUl } from "react-icons/fa6";
import PhotoDetector from '../../components/Shared/PhotoDetector';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [showAITools, setShowAITools] = useState(false);
  const [showPhotoLocator, setShowPhotoLocator] = useState(false);  // ← new state
  const navigate = useNavigate();

  const handleToggle = () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.add('collapsing');

    setTimeout(() => {
      sidebar.classList.remove('collapsing');
      setCollapsed(prev => {
        const newState = !prev;
        document.body.classList.toggle('nav-collapsed', newState);
        return newState;
      });
    }, 300);
  };

  return (
    <>
      <div className={`sidebar-wrapper ${collapsed ? 'collapsed' : ''}`} id="sidebar-wrapper">
        <button
          id="sidebarToggle"
          className="sidebar-toggle-btn"
          onClick={handleToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>

        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
          <div className={`icon-menu ${collapsed ? 'visible' : ''}`}>
            <div className="icon-item" title="My Pins">
              <img src={pinSvg} alt="My Pins" className="icon-img" />
            </div>
            <div className="icon-item" title="AI Tools" onClick={() => setShowAITools(true)}>
              <img src={robotSvg} alt="AI Tools" className="icon-img" />
            </div>
            <div className="icon-item" title="Photos">
              <img src={photosSvg} alt="Photos" className="icon-img" />
            </div>
            <div className="icon-item" title="Social">
              <img src={friendsSvg} alt="Social" className="icon-img" />
            </div>
            <div className="icon-item" title="Achievements">
              <img src={medalSvg} alt="Achievements" className="icon-img" />
            </div>
          </div>

          <div className={`cards ${collapsed ? 'hidden' : ''}`}>
            <div className="pins-card card">
              <h2 className="card-title">
                <img src={pinSvg} className="card-icon" alt="Pin Icon" />
                My Pins
              </h2>
              <img src={pinIcon} className="pin-card-graphic" alt="Pin on map" />
            </div>

            <div className="ai-card card cursor-pointer" onClick={() => setShowAITools(true)}>
              <h2 className="card-title">
                <img src={robotSvg} className="card-icon" alt="AI Icon" />
                AI Tools
              </h2>
              <img src={robotIcon} className="ai-card-graphic" alt="AI graphic" />
            </div>

            <div className="photos-card card">
              <h2 className="card-title">
                <img src={photosSvg} className="card-icon" alt="Photos Icon" />
                Photos
              </h2>
              <p className="photo-prompt">No photos yet. Start tracking your memories!</p>
              <img src={photosIcon} className="photos-card-graphic" alt="Photos graphic" />
            </div>

            <div className="social-card card">
              <h2 className="card-title">
                <img src={friendsSvg} className="card-icon" alt="Friends Icon" />
                Social
              </h2>
              <p className="social-placeholder">No friends yet! Connect to start sharing moments.</p>
              <button className="add-friend-btn">Add Friends</button>
            </div>

            <div className="achivements-card card">
              <h2 className="card-title">
                <img src={medalSvg} className="card-icon" alt="Achievements Icon" />
                Achievements
              </h2>
              <img src={medalIcon} className="achievement-card-graphic" alt="Achievement" />
            </div>
          </div>

          <div className="mountains">
            <img src={sidebarMountains} className="mountains-img" alt="Mountains" />
          </div>
        </div>
      </div>

      {showAITools && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-45">
          <div className="relative w-11/12 sm:w-3/4 lg:w-1/2 p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
            <button
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
              onClick={() => setShowAITools(false)}
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold text-transparent mb-8 text-center font-[be_vietnam_pro] bg-clip-text bg-gradient-to-r from-white/20 via-white/100 to-white/20 bg-[length:200%_100%] animate-rainbowShimmer">
              AI Tools
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Location Finder */}
              <button
                className="group relative flex flex-col items-center justify-center p-6 rounded-xl bg-white/10 transition border border-white/30 backdrop-blur-md overflow-hidden hover:scale-[1.02] hover:-translate-y-1 duration-500 ease-out"
                onClick={() => {
                  setShowAITools(false);
                  setShowPhotoLocator(true); 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <FaMapMarkerAlt className="text-4xl text-white group-hover:text-red-500 mb-2 transition" />
                <span className="text-white font-medium mt-1 text-center">Location Finder</span>
              </button>

              {/* Trip Planner */}
              <button
                className="group relative flex flex-col items-center justify-center p-6 rounded-xl bg-white/10 transition border border-white/30 backdrop-blur-md overflow-hidden hover:scale-[1.02] hover:-translate-y-1 duration-500 ease-out"
                onClick={() => {
                  setShowAITools(false);
                  navigate('/trip-planner');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <FaListUl className="text-4xl text-white group-hover:text-sky-300 mb-2 transition" />
                <span className="text-white font-medium mt-1">Trip Planner</span>
              </button>

              {/* Roadtrip Mode */}
              <div className="group relative flex flex-col items-center justify-center p-6 rounded-xl bg-white/10 border border-white/30 opacity-30 cursor-not-allowed backdrop-blur-md overflow-hidden">
                <FaRoute className="text-4xl text-white group-hover:text-orange-300 mb-2 transition" />
                <span className="text-white font-medium mt-1">Roadtrip Mode</span>
                <div className="absolute text-xs text-white bg-black/60 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                  Coming Soon!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In‑context Photo Locator drawer */}
      {showPhotoLocator && (
      <PhotoDetector onClose={() => setShowPhotoLocator(false)} />
     )}
    </>
  );
};

export default Sidebar;
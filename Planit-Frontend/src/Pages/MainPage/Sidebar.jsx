import { useState } from 'react';
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

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.add('collapsing');

    setTimeout(() => {
      sidebar.classList.remove('collapsing');
      setCollapsed(prev => !prev);
    }, 300); // match animation duration
  };

  return (
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
          <div className="icon-item" title="AI Tools">
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
            <span>
              <img src={pinIcon} className="pin-card-graphic" alt="Pin on map" />
            </span>
          </div>

          <div className="ai-card card">
            <h2 className="card-title">
              <img src={robotSvg} className="card-icon" alt="AI Icon" />
              AI Tools
            </h2>
            <span>
              <img src={robotIcon} className="ai-card-graphic" alt="AI graphic" />
            </span>
          </div>

          <div className="photos-card card">
            <h2 className="card-title">
              <img src={photosSvg} className="card-icon" alt="Photos Icon" />
              Photos
            </h2>
            <span>
              <p className="photo-prompt">No photos yet. Start tracking your memories!</p>
              <img src={photosIcon} className="photos-card-graphic" alt="Photos graphic" />
            </span>
          </div>

          <div className="social-card card">
            <h2 className="card-title">
              <img src={friendsSvg} className="card-icon" alt="Friends Icon" />
              Social
            </h2>
            <span className="social-placeholder">
              <p>No friends yet! Connect with friends to start sharing moments.</p>
              <button className="add-friend-btn">Add Friends</button>
            </span>
          </div>

          <div className="achivements-card card">
            <h2 className="card-title">
              <img src={medalSvg} className="card-icon" alt="Achievements Icon" />
              Achievements
            </h2>
            <span>
              <img src={medalIcon} className="achievement-card-graphic" alt="Achievement" />
            </span>
          </div>
        </div>

        <div className="mountains">
          <img src={sidebarMountains} className="mountains-img" alt="Mountains" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

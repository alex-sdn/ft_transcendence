import React, { useState } from 'react';
import ProfileBadges from './ProfileBadges';
import ProfileList from './ProfileList';
// Interface pour les propriétés de chaque onglet
interface TabProps {
  label: string;
  children: React.ReactNode; // children est requis dans chaque onglet
}

// Composant de l'onglet
const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>; // Utilisez simplement children ici
};

// Interface pour les propriétés des onglets
interface TabsProps {
  children: React.ReactElement<TabProps>[]; // Utilisez React.ReactElement avec TabProps
}

// Composant des onglets
const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div>
      <div className="tab-list">
        {children.map((child, index) => (
          <div
            key={index}
            className={`tab ${index === activeTab ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            {child.props.label}
          </div>
        ))}
      </div>
      <div className="tab-content">
        {children[activeTab].props.children}
      </div>
    </div>
  );
};

// Exemple d'utilisation
const ProfileTabs: React.FC = () => {
  return (
    <Tabs>
      <Tab label="Friends">
        {<ProfileList/>}
      </Tab>
      <Tab label="Achievements">
        {<ProfileBadges/>}
      </Tab>
    </Tabs>
  );
};

export default ProfileTabs;
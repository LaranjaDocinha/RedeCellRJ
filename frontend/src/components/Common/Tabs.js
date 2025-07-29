import React, { useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState('1');

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <>
      <Nav tabs>
        {tabs.map((tab, index) => (
          <NavItem key={index}>
            <NavLink
              className={classnames({ active: activeTab === String(index + 1) })}
              onClick={() => {
                toggle(String(index + 1));
              }}
            >
              {tab.title}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent activeTab={activeTab}>
        {tabs.map((tab, index) => (
          <TabPane key={index} tabId={String(index + 1)}>
            {tab.content}
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default Tabs;

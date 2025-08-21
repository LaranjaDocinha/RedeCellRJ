
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

const routes = [
  // You can add custom breadcrumbs here if needed, for example:
  // { path: '/users/:userId', breadcrumb: 'User Details' },
];

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs(routes);

  return (
    <Breadcrumb>
      {breadcrumbs.map(({ match, breadcrumb }) => (
        <BreadcrumbItem key={match.pathname}>
          <NavLink to={match.pathname}>{breadcrumb}</NavLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;

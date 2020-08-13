import React from 'react';
import { RouteProps, Switch } from 'react-router-dom';
import { RouteWithSubRoutes } from '../../router';
import { currentUserNameQuery } from '../../store';
import { useRecoilValueLoadable } from 'recoil';

interface Props {
  routes: RouteProps[];
}

const SignLayout: React.FC<Props> = ({ routes }) => {
  const userNameLoadable = useRecoilValueLoadable(currentUserNameQuery);
  return (
    <div>
      <Switch>
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
      </Switch>
    </div>
  );
};

export default SignLayout;

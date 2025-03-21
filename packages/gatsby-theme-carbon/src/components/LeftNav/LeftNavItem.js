import React, { useContext, useEffect } from 'react';
import { Link } from 'gatsby';
import { Location } from '@reach/router';
import cx from 'classnames';
import { useNetworkState } from 'react-use';
import { breakpoints } from '@carbon/elements';

import { SideNavLink, SideNavMenu, SideNavMenuItem } from '@carbon/react';

import * as styles from './LeftNav.module.scss';

import NavContext from '../../util/context/NavContext';
import usePathprefix from '../../util/hooks/usePathprefix';
import useMetadata from '../../util/hooks/useMetadata';

export const SERVICE_WORKER_UPDATE_FOUND = 'GTC-ServiceWorkerUpdateFound';

const LeftNavItem = (props) => {
  const { items, category, hasDivider } = props;
  const { toggleNavState, leftNavIsOpen } = useContext(NavContext);
  const { isServiceWorkerEnabled } = useMetadata();
  const isOnline = useNetworkState();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLgWindow = window.matchMedia(
        `(min-width: ${breakpoints.lg.width})`
      ).matches;

      if (isLgWindow) {
        toggleNavState('leftNavIsOpen', 'open');
      } else {
        toggleNavState('leftNavIsOpen', 'close');
      }
    }
  }, []);

  const handleClick = (event, to) => {
    toggleNavState('leftNavIsOpen', 'close');
    if (isServiceWorkerEnabled) {
      if (isOnline && window[SERVICE_WORKER_UPDATE_FOUND] === true) {
        event.preventDefault();
        window.location.href = to;
      }
    }
  };

  const pathPrefix = usePathprefix();

  return (
    <Location>
      {({ location }) => {
        const pathname = pathPrefix
          ? location.pathname.replace(pathPrefix, '')
          : location.pathname;

        const isActive = items.some(
          (item) => item.path.split('/')[1] === pathname.split('/')[1]
        );

        if (items.length === 1) {
          const to = items[0].path;
          return (
            <>
              <SideNavLink
                isSideNavExpanded={leftNavIsOpen}
                tabIndex={!leftNavIsOpen ? -1 : 0}
                onClick={(e) => handleClick(e, to)}
                icon={<span>dummy icon</span>}
                element={Link}
                className={cx({
                  [styles.currentItem]: isActive,
                })}
                isActive={isActive}
                to={to}>
                {category}
              </SideNavLink>
              {hasDivider && <hr className={styles.divider} />}
            </>
          );
        }
        return (
          <>
            <SideNavMenu
              icon={<span>dummy icon</span>}
              isActive={isActive} // TODO similar categories
              defaultExpanded={isActive}
              title={category}
              isSideNavExpanded={leftNavIsOpen}
              tabIndex={!leftNavIsOpen ? -1 : 0}>
              <SubNavItems
                onClick={handleClick}
                items={items}
                pathname={pathname}
              />
            </SideNavMenu>
            {hasDivider && <hr className={styles.divider} />}
          </>
        );
      }}
    </Location>
  );
};

const SubNavItems = ({ items, pathname, onClick }) =>
  items.map((item, i) => {
    const hasActiveTab =
      `${item.path.split('/')[1]}/${item.path.split('/')[2]}` ===
      `${pathname.split('/')[1]}/${pathname.split('/')[2]}`;
    const to = item.path;
    return (
      <SideNavMenuItem
        to={to}
        onClick={(e) => onClick(e, to)}
        element={Link}
        isActive={hasActiveTab}
        key={i}>
        {item.title}
      </SideNavMenuItem>
    );
  });

export default LeftNavItem;

/***
 *
 *   MENU
 *   main app navigation
 *
 **********/
import React from 'react'
import { NavLink, matchPath, useLocation } from 'react-router-dom'

import { Icon } from '@/components'
import Style from './Menu.module.css'

type NavItem = {
  link: string;
  icon: string;
  name: string;
  related: Array<string>;
  label: string;
  disabled: boolean;
};

const navItems: Array<NavItem> = [
  {
    link: '/paymaster',
    icon: 'star',
    name: 'Paymaster',
    related: ['/'],
    label: 'Paymaster',
    disabled: false,
  }
]

const verifyLinkClasses = (isDisabled: boolean, relatedArr: Array<string>, pathname: string) => {
  if (isDisabled) {
    return 'menu-item-disabled'
  }

  if (relatedArr?.length > 0 && relatedArr?.some((path) => matchPath(path, pathname))) {
    return 'menu-item-active'
  }

  return 'menu-item'
}

export const Menu = () => {
  const { pathname } = useLocation()

  return (
    <nav className={Style['menu']}>
      {navItems?.map(item => {
          return (
            <NavLink
              to={item.link}
              className={Style[verifyLinkClasses(item.disabled, item.related, pathname)]}
              key={item.label}
            >
              {({ isActive }) => (
                <>
                  {item.icon && <Icon name={item.icon} width="16" height="16" active={isActive} />}
                  {item.label && (
                    <span
                      className={isActive ? Style['label-active'] : Style['label']} 
                    >
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
    </nav>
  )
}

import { NavLink, useLocation } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS } from '../routes/paths';

interface FooterNavProps {
  wide?: boolean;
}

export function FooterNav({ wide = false }: FooterNavProps) {
  const { pathname } = useLocation();

  return (
    <nav className={`footer-nav${wide ? ' footer-nav--wide' : ''}`} aria-label="Navegación principal">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = item.match.some((path) => pathname === path);

        return (
          <NavLink
            key={item.label}
            to={item.to}
            className={`footer-nav__item${isActive ? ' footer-nav__item--active' : ''}${'highlight' in item && item.highlight ? ' footer-nav__item--cta' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="footer-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="footer-nav__label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

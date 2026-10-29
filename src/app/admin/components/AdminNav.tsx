import { NavLink } from 'react-router-dom';
import { admin } from '../../../shared/content/strings';
import { gradient } from '../../../shared/design-system/surfaces';
import { textSoft } from '../../../shared/design-system/typography';

export function AdminNav() {
  return (
    <nav className="mb-6 flex gap-1 rounded-[var(--main-page-radius-md)] border border-[var(--main-page-border)] bg-[var(--main-page-surface-muted)] p-1">
      <NavLink
        to="/admin/config"
        end
        className={({ isActive }) =>
          `flex-1 rounded-[calc(var(--main-page-radius-md)-4px)] px-4 py-2.5 text-center text-[0.92rem] font-medium transition-colors ${
            isActive
              ? `${gradient.tabActive} text-white shadow-sm`
              : `${textSoft} hover:text-[var(--color-text)]`
          }`
        }
      >
        {admin.config.title}
      </NavLink>
      <NavLink
        to="/admin/snapshots"
        className={({ isActive }) =>
          `flex-1 rounded-[calc(var(--main-page-radius-md)-4px)] px-4 py-2.5 text-center text-[0.92rem] font-medium transition-colors ${
            isActive
              ? `${gradient.tabActive} text-white shadow-sm`
              : `${textSoft} hover:text-[var(--color-text)]`
          }`
        }
      >
        {admin.snapshots.title}
      </NavLink>
      <NavLink
        to="/admin/stocks"
        className={({ isActive }) =>
          `flex-1 rounded-[calc(var(--main-page-radius-md)-4px)] px-4 py-2.5 text-center text-[0.92rem] font-medium transition-colors ${
            isActive
              ? `${gradient.tabActive} text-white shadow-sm`
              : `${textSoft} hover:text-[var(--color-text)]`
          }`
        }
      >
        {admin.stocks.title}
      </NavLink>
      <NavLink
        to="/admin/contests"
        className={({ isActive }) =>
          `flex-1 rounded-[calc(var(--main-page-radius-md)-4px)] px-4 py-2.5 text-center text-[0.92rem] font-medium transition-colors ${
            isActive
              ? `${gradient.tabActive} text-white shadow-sm`
              : `${textSoft} hover:text-[var(--color-text)]`
          }`
        }
      >
        {admin.contests.title}
      </NavLink>
    </nav>
  );
}

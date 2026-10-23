import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { surface } from '../design-system/surfaces';

interface SideBarLinkProps {
	to: string;
	onClick?: () => void;
	children: string;
	icon?: ReactNode;
}

export function SideBarLink({ to, onClick, children, icon }: SideBarLinkProps) {
	return (
		<NavLink
			to={to}
			onClick={onClick}
			className={({ isActive }) =>
				`${surface.sidebarNavLink} ${
					isActive
						? 'bg-white/10 font-semibold'
						: 'text-[var(--main-page-inverse-text-soft)] hover:bg-white/5'
				}`
			}
		>
			{icon}
			<span>{children}</span>
		</NavLink>
	);
}

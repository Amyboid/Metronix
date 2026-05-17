import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

/**
 * Merge the built-in admin statements so both roles inherit all standard
 * better-auth admin capabilities (user CRUD, ban, impersonate, session ops…).
 */
const statement = {
	...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

/**
 * admin — standard admin capabilities, cannot impersonate other admins.
 */
export const adminRole = ac.newRole({
	...adminAc.statements,
});

/**
 * super_admin — everything admin can do, plus the ability to impersonate
 * other admins. Treated as the top-level authority in this panel.
 */
export const superAdminRole = ac.newRole({
	...adminAc.statements,
	user: ['impersonate-admins', ...adminAc.statements.user],
});
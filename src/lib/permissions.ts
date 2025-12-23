import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
    ...defaultStatements,
    agency: ['create', 'update', 'delete', 'publish', 'payout-manage', 'sales-view', 'sales-export'],
    project: ['create', 'update', 'delete'],
    organization: ['create', 'update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
    agency: ['publish', 'payout-manage', 'sales-view', 'sales-export'],
    project: ['create', 'update', 'delete'],
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    ...adminAc.statements,
});
export const superadmin = ac.newRole({
    project: ['create', 'update', 'delete'],
    organization: ['create', 'update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    ...adminAc.statements,
});
export const owner = ac.newRole({
    agency: ['create', 'update', 'delete', 'publish', 'payout-manage', 'sales-view', 'sales-export'],
    organization: ['create', 'update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    ...adminAc.statements,
});

export const editor = ac.newRole({
    agency: ['publish', 'payout-manage', 'sales-view'],
    organization: ['update'],
});

export const member = ac.newRole({
    agency: ['sales-view', 'publish'],
});

export const user = ac.newRole({
    ...adminAc.statements,
});



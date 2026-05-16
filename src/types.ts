/**
 * Authentik REST API v3 — types aligned with OpenAPI spec v2026.5
 *
 * Only the fields consumed by the catalog provider are declared here.
 * Endpoints used:
 *   GET /api/v3/core/users/    → AuthentikUser[]
 *   GET /api/v3/core/groups/   → AuthentikGroup[]
 */

/** Embedded group reference, returned inside AuthentikUser.groups_obj */
export interface AuthentikGroupRef {
  pk: string; // UUID
  name: string;
  parent_name: string | null;
}

/** Embedded user reference, returned inside AuthentikGroup.users_obj */
export interface AuthentikUserRef {
  pk: number;
  username: string;
  name: string;
  email: string;
  is_active: boolean;
}

/** Response item from GET /api/v3/core/users/ */
export interface AuthentikUser {
  pk: number;
  username: string;
  name: string;
  email: string;
  avatar: string;
  is_active: boolean;
  type: string;
  groups_obj: AuthentikGroupRef[];
}

/** Response item from GET /api/v3/core/groups/ */
export interface AuthentikGroup {
  pk: string; // UUID — used as annotation for traceability
  name: string;
  parent: string | null; // UUID of parent group
  parent_name: string | null;
  users_obj: AuthentikUserRef[];
}

/** Pagination envelope returned by all Authentik list endpoints */
export interface AuthentikPagination {
  next: number | null;
  previous: number | null;
  count: number;
  current: number;
  total_pages: number;
  start_index: number;
  end_index: number;
}

/** Generic paginated response wrapper */
export interface AuthentikPaginatedResponse<T> {
  pagination: AuthentikPagination;
  results: T[];
}

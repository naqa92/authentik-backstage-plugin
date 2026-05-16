import {
  AuthentikUser,
  AuthentikGroup,
  AuthentikPaginatedResponse,
} from './types';

async function fetchAll<T>(
  baseUrl: string,
  path: string,
  token: string,
): Promise<T[]> {
  const items: T[] = [];
  // Authentik returns pagination.next as a number (0 when there is no next
  // page, not null/undefined). Truthy check handles 0, null and undefined.
  let nextPage: number | null = 1;

  while (nextPage) {
    const url = `${baseUrl}${path}?page_size=100&page=${nextPage}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(
        `Authentik API ${path} failed: ${res.status} ${res.statusText}`,
      );
    }
    const data: AuthentikPaginatedResponse<T> = await res.json();
    items.push(...data.results);
    nextPage = data.pagination.next;
  }

  return items;
}

export function readUsers(
  baseUrl: string,
  token: string,
): Promise<AuthentikUser[]> {
  return fetchAll<AuthentikUser>(baseUrl, '/api/v3/core/users/', token);
}

export function readGroups(
  baseUrl: string,
  token: string,
): Promise<AuthentikGroup[]> {
  return fetchAll<AuthentikGroup>(baseUrl, '/api/v3/core/groups/', token);
}

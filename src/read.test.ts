import { readGroups, readUsers } from './read';
import {
  AuthentikGroup,
  AuthentikPaginatedResponse,
  AuthentikUser,
} from './types';

type FetchMock = jest.Mock<Promise<Response>>;

function mockResponse<T>(body: AuthentikPaginatedResponse<T>): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
  } as unknown as Response;
}

function mockError(status: number, statusText: string): Response {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({}),
  } as unknown as Response;
}

function paginate<T>(
  results: T[],
  current: number,
  totalPages: number,
): AuthentikPaginatedResponse<T> {
  return {
    pagination: {
      next: current < totalPages ? current + 1 : null,
      previous: current > 1 ? current - 1 : null,
      count: results.length,
      current,
      total_pages: totalPages,
      start_index: 1,
      end_index: results.length,
    },
    results,
  };
}

describe('read', () => {
  let fetchSpy: FetchMock;

  beforeEach(() => {
    fetchSpy = jest.fn() as FetchMock;
    (global as unknown as { fetch: FetchMock }).fetch = fetchSpy;
  });

  it('reads users in a single page', async () => {
    const userPage: AuthentikUser[] = [
      {
        pk: 1,
        username: 'alice',
        name: 'Alice',
        email: '',
        avatar: '',
        is_active: true,
        groups_obj: [],
      },
    ];
    fetchSpy.mockResolvedValueOnce(mockResponse(paginate(userPage, 1, 1)));

    const users = await readUsers('https://authentik.example.com', 'token');

    expect(users).toEqual(userPage);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toContain('/api/v3/core/users/');
    expect(fetchSpy.mock.calls[0][1]).toEqual({
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('follows pagination across two pages for groups', async () => {
    const groupsPage1: AuthentikGroup[] = [
      {
        pk: 'g1',
        name: 'g1',
        parent: null,
        parent_name: null,
        users_obj: [],
      },
    ];
    const groupsPage2: AuthentikGroup[] = [
      {
        pk: 'g2',
        name: 'g2',
        parent: null,
        parent_name: null,
        users_obj: [],
      },
    ];
    fetchSpy
      .mockResolvedValueOnce(mockResponse(paginate(groupsPage1, 1, 2)))
      .mockResolvedValueOnce(mockResponse(paginate(groupsPage2, 2, 2)));

    const groups = await readGroups('https://authentik.example.com', 'token');

    expect(groups).toEqual([...groupsPage1, ...groupsPage2]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[1][0]).toContain('page=2');
  });

  it('throws when the API returns a non-OK status', async () => {
    fetchSpy.mockResolvedValueOnce(mockError(401, 'Unauthorized'));
    await expect(
      readUsers('https://authentik.example.com', 'bad-token'),
    ).rejects.toThrow(/401 Unauthorized/);
  });
});

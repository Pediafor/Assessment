import axios from 'axios';
import { getUserById } from '../src/services/user.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('user.service', () => {
  it('returns user when found', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: 'u1', email: 'a@b.com', firstName: 'A' } });
    const user = await getUserById('u1');
    expect(user?.email).toBe('a@b.com');
  });

  it('returns null on 404', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });
    const user = await getUserById('missing');
    expect(user).toBeNull();
  });
});

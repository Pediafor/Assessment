import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4000';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
    return response.data as User;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Failed to fetch user details:', error);
    return null;
  }
}

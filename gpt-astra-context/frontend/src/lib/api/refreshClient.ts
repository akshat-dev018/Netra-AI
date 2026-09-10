import axios from 'axios';
import { env } from '@/lib/env';

export const refreshClient = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
  withCredentials: true,
});

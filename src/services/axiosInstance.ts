"use client";

import { BASE_API } from '@/constant/API';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: BASE_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;

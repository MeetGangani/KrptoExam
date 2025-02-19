import { apiSlice } from './apiSlice';

const apiUrl = import.meta.env.VITE_BACKEND_URI;

console.log("Inside usersApiSlice");

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${apiUrl}/api/users/auth`,
        method: 'POST',
        body: data,
         
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${apiUrl}/api/users/logout`,
        method: 'POST',
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${apiUrl}/api/users`,
        method: 'POST',
        body: data,
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${apiUrl}/api/users/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateUserMutation,
} = userApiSlice;

/** Authenticated user profile returned by the backend JWT. */
export interface UserProfile {
  userId: string;
  username: string;
  name: string;
  email: string;
  department: string;
  function: string;
  location: string;
  manager: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user_id: string;
    username: string;
    name: string;
    email: string;
    department: string;
    function: string;
    location: string;
    manager: string;
    role: string;
  };
}

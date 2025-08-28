export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  email: string;
  password: string;
}
export interface IRefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: number | Date;
}

export interface IFriendRequest {
  id: string;
  receiver_id: string;
  sender_id: string;
  status: string;
}

export interface IFriendRequestWithSender extends IFriendRequest {
  first_name: string;
  last_name: string;
  email: string;
}

export interface IFriends {
  id: string;
  user_id_1: string;
  user_id_2: string;
}

export interface IResponseType<T> {
  success?: boolean;
  statusCode?: number;
  data?: T;
  message?: string;
}

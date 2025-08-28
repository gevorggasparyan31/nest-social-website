export enum FRIEND_REQUESTS_STATUS {
  PENDING = 'pending',
  DECLINED = 'declined',
  ACCEPTED = 'accepted',
}

export enum FRIEND_REQUESTS_ACTION {
  ACCEPT = 'accept',
  DECLINE = 'decline',
}

export const invalidActionType = 'Action must be either "accept" or "decline"';
export const friendRequestConflict =
  'The user cannot send a request to himself';
export const invalidPendingRequest =
  'Request is invalid and can not be {action}ed';

export const requestActionSuccessfully =
  'The request has been {action}ed successfully';

export const alreadyFriends = 'You are already friends with this user';
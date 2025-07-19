type ObjectStatus = 
  'offline' |
  'staging' |
  'awaiting' | 
  'reviewed' | 
  'rejected' | 
  'signaled' | 
  'online' | 
  'archived'

type LoginResponse = {
  login: LogIn,
}

type LogIn = {
  accessToken   : string,
  refreshToken  : string,
  refreshValidityDuration: number,
  accessValidityDuration: number,     
  user      : UserLoggedIn,
  message   : string,
  errors    : [MutationError],
}

type UserLoggedIn = {
  userID        : number,
  uniqRef       : string,
  slug          : string,
  username      : string,
  email         : string,
  plan          : string,
  profileID?    : number,
  lastLogin     : Date,
  loginDuration : number,
  state         : string,
  createdAt?     : Date,
  updatedAt     : Date,
  twoFactorEnabled: Boolean,
}

type TokenRefreshResponse = {
  accessToken: string,
  expiresIn: number,
  message: string,
  errors: [MutationError],
}

type MutationError = {
  message : string,
}

type LogoutResponse = {
  success: boolean,
  message: string,
}

type AppLoginResponse = {
  authenticateApp: AppLogIn,
}

type AppLogIn = {
  accessToken   : string,
  refreshToken  : string,
  refreshValidityDuration: number,
  accessValidityDuration: number,     
  app      : AppLoggedIn, 
  errors    : [MutationError],
}

type AppLoggedIn = {
  applicationID : string,
  uniqRef       : string,
  slug          : string,
  authKey?       : string,
  authID?        : string,
  description?   : string,
  name?          : string,
  email?         : string,
  logo?          : string,
  url?           : string,
  plan?          : string,
  isOfficialApp? : Boolean,
  appConfiguration? : string,
  developerID?   : number,
  authorID?      : number,
  state         : ObjectStatus,
  createdAt     : Date,
  updatedAt     : Date,  
}
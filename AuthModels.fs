namespace SmokeTracker.AuthModels

[<CLIMutable>]
type AuthSettings =
    { Issuer: string
      Audience: string
      SymmetricSecurityKey: string }

[<CLIMutable>]
type LoginDto = { Username: string; Password: string }

type TokenResult = { Success: bool; Token: string; ExpiresIn: int }
type FailedLoginResult = { Success: bool; Message: string }

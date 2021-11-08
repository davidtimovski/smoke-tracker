namespace SmokeTracker.AuthModels

[<CLIMutable>]
type AuthSettings =
    { Issuer: string
      Audience: string
      SymmetricSecurityKey: string }

[<CLIMutable>]
type RegisterDto = { Username: string; Password: string }

[<CLIMutable>]
type LoginDto = { Username: string; Password: string }

type TokenResult = { Success: bool; Token: string; ExpiresIn: int }

type FailedLoginResult = { Success: bool; Message: string }

type RegisterResult = { Success: bool; Message: string }

type Result<'TSuccess,'TFailure> =
    | Success of 'TSuccess
    | Failure of 'TFailure

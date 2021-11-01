namespace SmokeTracker.AuthModels

[<CLIMutable>]
type AuthSettings =
    {
        Issuer : string
        Audience : string
        SymmetricSecurityKey : string
    }

[<CLIMutable>]
type LoginDto =
    {
        UserName : string
        Password : string
    }

[<CLIMutable>]
type TokenResult =
    {
        Token : string
    }
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
        Email : string
        Password : string
    }

[<CLIMutable>]
type TokenResult =
    {
        Token : string
    }
module SmokeTracker.Entities

open System
open Microsoft.AspNetCore.Identity

[<AllowNullLiteral>]
type User() =
    inherit IdentityUser<int>()

type SmokeType =
    | Cigar = 0
    | Vape = 1
    | Heet = 2

[<CLIMutable>]
type Smoke =
    { Id: Guid
      UserId: int
      Type: SmokeType
      Date: DateTime }

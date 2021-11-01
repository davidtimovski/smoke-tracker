module SmokeTracker.Entities

open System

[<CLIMutable>]
type User =
    {
        Id : int
        Username : string
    }

type SmokeType = 
    | Cigar = 0
    | Vape = 1
    | Heet = 2

[<CLIMutable>]
type Smoke =
    {
        Id : Guid
        UserId : int
        Type : SmokeType
        Date : DateTime
    }

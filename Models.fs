namespace SmokeTracker.Models

open SmokeTracker.Entities
open System

[<CLIMutable>]
type SmokeDto =
    { Id: Guid
      Type: SmokeType
      Date: DateTime }

[<CLIMutable>]
type DeleteSmokeDto = { Id: Guid }

[<CLIMutable>]
type SmokesSync = 
    { New: Smoke []
      Updated: Smoke []
      Deleted: Guid [] }

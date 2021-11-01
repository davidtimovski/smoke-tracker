namespace SmokeTracker.Models

open SmokeTracker.Entities
open System

[<CLIMutable>]
type SmokeDto =
    { Id: Guid
      Type: SmokeType
      Date: DateTime }

[<CLIMutable>]
type DeleteSmokesDto = { Ids: Guid [] }

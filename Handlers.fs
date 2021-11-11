module SmokeTracker.Handlers

open Microsoft.AspNetCore.Http
open Giraffe
open SmokeTracker.Data
open FSharp.Control.Tasks
open System.Linq
open Entities
open SmokeTracker.Models
open AuthHandlers

let createSmokeHandler: HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let userId = getCurrentUserId ctx

            let! smokeDto = ctx.BindJsonAsync<SmokeDto>()

            let smoke = { Id = smokeDto.Id
                          UserId = userId
                          Type = smokeDto.Type
                          Date = smokeDto.Date }

            let db = ctx.GetService<SmokeTrackerContext>()
            db.Smokes.Add(smoke) |> ignore
            db.SaveChanges() |> ignore

            ctx.SetStatusCode 201

            return! next ctx
        }

let deleteSmokeHandler: HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        let userId = getCurrentUserId ctx

        let dto = ctx.BindQueryString<DeleteSmokeDto>()

        let db = ctx.GetService<SmokeTrackerContext>()

        let smoke =
            db.Smokes.First(fun x -> dto.Id = x.Id && x.UserId = userId)

        db.Smokes.Remove(smoke) |> ignore
        db.SaveChanges() |> ignore

        ctx.SetStatusCode 204

        next ctx

let syncSmokesHandler: HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let userId = getCurrentUserId ctx

            let! smokeSync = ctx.BindJsonAsync<SmokesSync>()

            let db = ctx.GetService<SmokeTrackerContext>()

            let newSmokes =
                smokeSync.New
                |> Array.map
                    (fun x ->
                        { Id = x.Id
                          UserId = userId
                          Type = x.Type
                          Date = x.Date })

            db.Smokes.AddRange(newSmokes) |> ignore

            let updatedSmokes =
                smokeSync.Updated
                |> Array.map
                    (fun x ->
                        { Id = x.Id
                          UserId = userId
                          Type = x.Type
                          Date = x.Date })

            db.Smokes.AddRange(updatedSmokes) |> ignore

            let smokesToDelete =
                db
                    .Smokes
                    .Where(fun x -> smokeSync.Deleted.Contains(x.Id))
                    .ToArray()

            for smoke in smokesToDelete do
                db.Smokes.Remove(smoke) |> ignore

            db.SaveChanges() |> ignore

            ctx.SetStatusCode 201

            return! next ctx
        }

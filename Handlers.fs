module SmokeTracker.Handlers

open Microsoft.AspNetCore.Http
open Microsoft.EntityFrameworkCore
open Giraffe
open SmokeTracker.Data
open FSharp.Control.Tasks
open System.Linq
open Entities
open SmokeTracker.Models
open AuthHandlers

let createSmokesHandler: HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let userId = getCurrentUserId ctx

            let! smokeDtos = ctx.BindJsonAsync<seq<SmokeDto>>()

            let smokes =
                smokeDtos
                |> Seq.map
                    (fun x ->
                        { Id = x.Id
                          UserId = userId
                          Type = x.Type
                          Date = x.Date })

            let db = ctx.GetService<SmokeTrackerContext>()
            db.Smokes.AddRange(smokes) |> ignore
            db.SaveChanges() |> ignore

            ctx.SetStatusCode 201

            return! next ctx
        }

let deleteSmokesHandler: HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let userId = getCurrentUserId ctx

            let dto = ctx.BindQueryString<DeleteSmokesDto>()

            let db = ctx.GetService<SmokeTrackerContext>()

            let smokes =
                db
                    .Smokes
                    .Where(fun x -> dto.Ids.Contains(x.Id) && x.UserId = userId)
                    .ToList()

            db.Smokes.RemoveRange(smokes)
            db.SaveChanges() |> ignore

            ctx.SetStatusCode 204

            return! next ctx
        }

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

            let smokesToDelete = db.Smokes.Where(fun x -> smokeSync.Deleted.Contains(x.Id)).ToArray()
            for smoke in smokesToDelete do
                db.Smokes.Remove(smoke) |> ignore
            
            db.SaveChanges() |> ignore

            ctx.SetStatusCode 201

            return! next ctx
        }
module SmokeTracker.Routes

open Giraffe
open SmokeTracker.AuthHandlers
open SmokeTracker.Handlers
open System
open Microsoft.Extensions.Logging

let webApp : HttpHandler =
    choose [
        GET >=>
            choose [
                routef "/username-available/%s" userNameAvailableHandler
            ]
        POST >=>
            choose [
                route "/register" >=> registerHandler
                route "/token" >=> tokenHandler
                route "/smokes/sync" >=> authorize >=> syncSmokesHandler
                route "/smokes" >=> authorize >=> createSmokeHandler
            ]
        DELETE >=>
            choose [
                route "/smokes" >=> authorize >=> deleteSmokeHandler
            ]
        setStatusCode 404 >=> text "Not Found" ]

// ---------------------------------
// Error handler
// ---------------------------------

let errorHandler (ex : Exception) (logger : ILogger) =
    logger.LogError(ex, "An unhandled exception has occurred while executing the request.")
    clearResponse >=> setStatusCode 500 >=> text ex.Message
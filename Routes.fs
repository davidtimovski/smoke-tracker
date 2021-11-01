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
                route "/" >=> htmlFile "WebRoot/index.html"
                routef "/api/username-available/%s" userNameAvailableHandler
                route "/api/last-smoke-date" >=> lastSmokeDateHandler
                route "/api/secured" >=> authorize >=> handleGetSecured
            ]
        POST >=>
            choose [
                route "/api/register" >=> registerHandler
                route "/api/token" >=> tokenHandler
                route "/api/smokes" >=> createSmokesHandler
            ]
        DELETE >=>
            choose [
                route "/api/smokes" >=> deleteSmokesHandler
            ]
        setStatusCode 404 >=> text "Not Found" ]

// ---------------------------------
// Error handler
// ---------------------------------

let errorHandler (ex : Exception) (logger : ILogger) =
    logger.LogError(ex, "An unhandled exception has occurred while executing the request.")
    clearResponse >=> setStatusCode 500 >=> text ex.Message
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
                route "/api/last-smoke-date" >=> lastSmokeDateHandler
                route "/secured" >=> authorize >=> handleGetSecured
            ]
        POST >=>
            choose [
                route "/token" >=> handlePostToken
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
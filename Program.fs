module SmokeTracker.App

open System
open System.IO
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Cors.Infrastructure
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open Microsoft.Extensions.DependencyInjection
open Microsoft.EntityFrameworkCore
open Giraffe
open SmokeTracker.Data
open Microsoft.Extensions.Configuration
open SmokeTracker.Routes
open Microsoft.AspNetCore.Authentication.JwtBearer
open Microsoft.IdentityModel.Tokens
open System.Text

let configureApp (app: IApplicationBuilder) =
    let env =
        app.ApplicationServices.GetService<IWebHostEnvironment>()

    let settings =
        app.ApplicationServices.GetService<IConfiguration>()

    let configureCors (builder: CorsPolicyBuilder) =
        builder
            .WithOrigins(settings.GetValue<string>("Cors:Origin"))
            .AllowAnyMethod()
            .AllowAnyHeader()
        |> ignore

    (match env.IsDevelopment() with
     | true ->
         app
             .UseDeveloperExceptionPage()
             .UseCors(configureCors)
     | false ->
         app
             .UseAuthentication()
             .UseGiraffeErrorHandler(errorHandler))
        .UseCors(configureCors)
        .UseStaticFiles()
        .UseGiraffe(webApp)

let configureAppConfiguration (context: WebHostBuilderContext) (config: IConfigurationBuilder) =
    config
        .AddJsonFile("appsettings.json", false, true)
        .AddJsonFile(sprintf "appsettings.%s.json" context.HostingEnvironment.EnvironmentName, true)
        .AddEnvironmentVariables()
    |> ignore

let configureServices (services: IServiceCollection) =
    let serviceProvider = services.BuildServiceProvider()

    let settings =
        serviceProvider.GetService<IConfiguration>()

    services.AddDbContext<SmokeTrackerContext>
        (fun options ->
            options.UseNpgsql(settings.GetConnectionString("Default"))
            |> ignore)
    |> ignore

    services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(fun options ->
            options.TokenValidationParameters <-
                TokenValidationParameters(
                    ValidateActor = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = settings.GetValue<string>("Auth:Issuer"),
                    ValidAudience = settings.GetValue<string>("Auth:Audience"),
                    IssuerSigningKey =
                        SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(settings.GetValue<string>("Auth:SymmetricSecurityKey"))
                        )
                ))
    |> ignore

    services.AddCors() |> ignore
    services.AddGiraffe() |> ignore

let configureLogging (builder: ILoggingBuilder) =
    builder.AddConsole().AddDebug() |> ignore

[<EntryPoint>]
let main args =
    let contentRoot = Directory.GetCurrentDirectory()
    let webRoot = Path.Combine(contentRoot, "WebRoot")

    Host
        .CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(fun webHostBuilder ->
            webHostBuilder
                .UseContentRoot(contentRoot)
                .UseWebRoot(webRoot)
                .ConfigureAppConfiguration(configureAppConfiguration)
                .Configure(Action<IApplicationBuilder> configureApp)
                .ConfigureServices(configureServices)
                .ConfigureLogging(configureLogging)
                .UseUrls("http://localhost:5100")
            |> ignore)
        .Build()
        .Run()

    0

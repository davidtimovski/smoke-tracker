module SmokeTracker.AuthHandlers

open Microsoft.AspNetCore.Http
open Giraffe
open FSharp.Control.Tasks
open Microsoft.AspNetCore.Authentication.JwtBearer
open System.Security.Claims
open System.IdentityModel.Tokens.Jwt
open System
open Microsoft.IdentityModel.Tokens
open System.Text
open SmokeTracker.AuthModels
open Microsoft.Extensions.Configuration
open Microsoft.AspNetCore.Identity
open Entities

let userNameAvailableHandler (userName : string) : HttpHandler =
    fun (next : HttpFunc) (ctx : HttpContext) ->
        task {
            let userManager = ctx.GetService<UserManager<User>>()
            let! user = userManager.FindByNameAsync(userName)
            return! json (isNull user) next ctx
        }

let registerHandler =
    fun (next : HttpFunc) (ctx : HttpContext) ->
        task {
            let! model = ctx.BindJsonAsync<LoginDto>()
            let userManager = ctx.GetService<UserManager<User>>()

            let user = User(UserName = model.UserName)
            let! result = userManager.CreateAsync(user, model.Password)

            match result.Succeeded with
            | true ->
                ctx.SetStatusCode 201
            | false ->
                ctx.SetStatusCode 422

            return! next ctx
        }


let authorize =
    fun (next : HttpFunc) (ctx : HttpContext) ->
        requiresAuthentication (challenge JwtBearerDefaults.AuthenticationScheme) next ctx

let generateToken userName (issuer : string) (audience : string) (secret : string) =
    let claims = [|
        Claim(JwtRegisteredClaimNames.Sub, userName);
        Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) |]

    let expires = Nullable(DateTime.UtcNow.AddHours(1.0))
    let notBefore = Nullable(DateTime.UtcNow)
    let securityKey = SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    let signingCredentials = SigningCredentials(key = securityKey, algorithm = SecurityAlgorithms.HmacSha256)

    let token =
        JwtSecurityToken(
            issuer = issuer,
            audience = audience,
            claims = claims,
            expires = expires,
            notBefore = notBefore,
            signingCredentials = signingCredentials)

    let tokenResult = {
        Token = JwtSecurityTokenHandler().WriteToken(token)
    }

    tokenResult

let handleGetSecured =
    fun (next : HttpFunc) (ctx : HttpContext) ->
        let email = ctx.User.FindFirst ClaimTypes.NameIdentifier
            
        text ("User " + email.Value + " is authorized to access this resource.") next ctx

let tokenHandler =
    fun (next : HttpFunc) (ctx : HttpContext) ->
        task {
            let! model = ctx.BindJsonAsync<LoginDto>()
            let userManager = ctx.GetService<UserManager<User>>()

            let! user = userManager.FindByNameAsync(model.UserName) 
            let! loginIsValid = userManager.CheckPasswordAsync(user, model.Password)

            match loginIsValid with
            | true ->
                let settings = ctx.GetService<IConfiguration>()
                let issuer = settings.GetValue<string>("Auth:Issuer")
                let audience = settings.GetValue<string>("Auth:Audience")
                let secret = settings.GetValue<string>("Auth:SymmetricSecurityKey")

                let tokenResult = generateToken model.UserName issuer audience secret

                return! json tokenResult next ctx
            | false ->
                ctx.SetStatusCode 401

                return! next ctx
        }

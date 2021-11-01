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

let authorize =
    fun (next : HttpFunc) (ctx : HttpContext) ->
        requiresAuthentication (challenge JwtBearerDefaults.AuthenticationScheme) next ctx

let generateToken email (issuer : string) (audience : string) (secret : string) =
    let claims = [|
        Claim(JwtRegisteredClaimNames.Sub, email);
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

let handlePostToken =
    fun (next : HttpFunc) (ctx : HttpContext) ->
        task {
            let! model = ctx.BindJsonAsync<LoginDto>()
            let settings = ctx.GetService<IConfiguration>()
            
            let issuer = settings.GetValue<string>("Auth:Issuer")
            let audience = settings.GetValue<string>("Auth:Audience")
            let secret = settings.GetValue<string>("Auth:SymmetricSecurityKey")

            // authenticate user
            
            let tokenResult = generateToken model.Email issuer audience secret

            return! json tokenResult next ctx
        }

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

let userNameAvailableHandler (userName: string) : HttpHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let userManager = ctx.GetService<UserManager<User>>()
            let! user = userManager.FindByNameAsync(userName)
            return! json (isNull user) next ctx
        }

let registerHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let! model = ctx.BindJsonAsync<LoginDto>()
            let userManager = ctx.GetService<UserManager<User>>()

            let user = User(UserName = model.Username)
            let! result = userManager.CreateAsync(user, model.Password)

            match result.Succeeded with
            | true -> ctx.SetStatusCode 201
            | false -> ctx.SetStatusCode 422

            return! next ctx
        }

let getCurrentUserId (ctx: HttpContext) =
    let nameIdentifier =
        ctx.User.FindFirst ClaimTypes.NameIdentifier

    Convert.ToInt32 nameIdentifier.Value

let authorize =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        requiresAuthentication (challenge JwtBearerDefaults.AuthenticationScheme) next ctx

let private generateToken (userId: int) (issuer: string) (audience: string) (secret: string) =
    let claims =
        [| 
            Claim(JwtRegisteredClaimNames.Sub, userId.ToString())
            Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        |]

    let tokenLastsMinutes = 60 * 24 * 30
    let expires = Nullable(DateTime.UtcNow.AddMinutes(float tokenLastsMinutes))
    let notBefore = Nullable(DateTime.UtcNow)

    let haha = expires.Value

    let securityKey =
        SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))

    let signingCredentials =
        SigningCredentials(key = securityKey, algorithm = SecurityAlgorithms.HmacSha256)

    let token =
        JwtSecurityToken(
            issuer = issuer,
            audience = audience,
            claims = claims,
            expires = expires,
            notBefore = notBefore,
            signingCredentials = signingCredentials
        )

    let token = JwtSecurityTokenHandler().WriteToken(token)

    {
        Success = true
        Token = token
        ExpiresIn = tokenLastsMinutes
    }

let tokenHandler =
    fun (next: HttpFunc) (ctx: HttpContext) ->
        task {
            let! model = ctx.BindJsonAsync<LoginDto>()
            let userManager = ctx.GetService<UserManager<User>>()
            let signInManager = ctx.GetService<SignInManager<User>>()

            let! user = userManager.FindByNameAsync(model.Username)
            if isNull user then
                let result = {
                    Success = false
                    Message = "Invalid login."
                }
                
                return! json result next ctx
            else
                let! signInResult = signInManager.PasswordSignInAsync(user, model.Password, false, true)

                match signInResult.Succeeded with
                | true ->
                    let settings = ctx.GetService<IConfiguration>()
                    let issuer = settings.GetValue<string>("Auth:Issuer")

                    let audience =
                        settings.GetValue<string>("Auth:Audience")

                    let secret =
                        settings.GetValue<string>("Auth:SymmetricSecurityKey")

                    let tokenResult = generateToken user.Id issuer audience secret

                    return! json tokenResult next ctx
                | false ->
                    match signInResult.IsLockedOut with
                    | true ->
                        ctx.SetStatusCode 422

                        let result = {
                            Success = false
                            Message = "You've been locked out."
                        }
                        return! json result next ctx
                    | false ->
                        ctx.SetStatusCode 401

                        let result = {
                            Success = false
                            Message = "Invalid login."
                        }
                        return! json result next ctx
        }

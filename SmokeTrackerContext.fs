namespace SmokeTracker.Data

open Microsoft.EntityFrameworkCore
open SmokeTracker.Entities
open Microsoft.AspNetCore.Identity
open Microsoft.AspNetCore.Identity.EntityFrameworkCore

type SmokeTrackerContext(options : DbContextOptions<SmokeTrackerContext>) = 
    inherit IdentityDbContext<User, IdentityRole<int>, int>(options)

    override _.OnModelCreating(modelBuilder : ModelBuilder) =
        base.OnModelCreating(modelBuilder)

        modelBuilder.Entity<User>().ToTable("Users") |> ignore

    [<DefaultValue>]
    val mutable smokes : DbSet<Smoke>
    member public this.Smokes with get() = this.smokes
                              and set p = this.smokes <- p
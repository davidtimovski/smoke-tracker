namespace SmokeTracker.Data

open Microsoft.EntityFrameworkCore
open SmokeTracker.Entities

type SmokeTrackerContext(options : DbContextOptions<SmokeTrackerContext>) = 
    inherit DbContext(options)

    [<DefaultValue>]
    val mutable users : DbSet<User>
    member public this.Users with get() = this.users
                             and set p = this.users <- p

    [<DefaultValue>]
    val mutable smokes : DbSet<Smoke>
    member public this.Smokes with get() = this.smokes
                              and set p = this.smokes <- p
CREATE TABLE IF NOT EXISTS public."AspNetUserLogins"
(
    "LoginProvider" text COLLATE pg_catalog."default" NOT NULL,
    "ProviderKey" text COLLATE pg_catalog."default" NOT NULL,
    "ProviderDisplayName" text COLLATE pg_catalog."default",
    "UserId" integer NOT NULL,
    CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
    CONSTRAINT "FK_AspNetUserLogins_Users_UserId" FOREIGN KEY ("UserId")
        REFERENCES public."Users" ("Id") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."AspNetUserLogins"
    OWNER to postgres;

CREATE INDEX IF NOT EXISTS "IX_AspNetUserLogins_UserId"
    ON public."AspNetUserLogins" USING btree
    ("UserId" ASC NULLS LAST)
    TABLESPACE pg_default;
	
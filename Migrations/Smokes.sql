CREATE TABLE IF NOT EXISTS public."Smokes"
(
    "Id" uuid NOT NULL,
    "UserId" integer NOT NULL,
    "Type" integer NOT NULL,
    "Date" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "Smokes_pkey" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Smokes_Users_UserId" FOREIGN KEY ("UserId")
        REFERENCES public."Users" ("Id") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Smokes"
    OWNER to postgres;
	
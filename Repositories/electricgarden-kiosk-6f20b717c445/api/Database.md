# DB and Migrations

We are using Entity Framework Core's Code First Migrations.

This means you don't have to write SQL or worry about mapping.

## Setup

Install the dotnet-ef tools:

`dotnet tool restore`

## Adding a migration

`SQL_CONNECTION_STRING= dotnet-ef migrations add PascaleCaseMigrationName`

## Updating/Creating the database

`SQL_CONNECTION_STRING= dotnet-ef database update`

See more at https://docs.microsoft.com/en-us/ef/core/miscellaneous/cli/dotnet

Or you can use the package manager console in Visual Studio but look in MS docs.
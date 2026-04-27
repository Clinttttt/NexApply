using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexApply.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialAndHiringManagerFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FacebookUrl",
                table: "CompanyProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HiringManagerEmail",
                table: "CompanyProfiles",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HiringManagerName",
                table: "CompanyProfiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HiringManagerTitle",
                table: "CompanyProfiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwitterUrl",
                table: "CompanyProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FacebookUrl",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "HiringManagerEmail",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "HiringManagerName",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "HiringManagerTitle",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "TwitterUrl",
                table: "CompanyProfiles");
        }
    }
}

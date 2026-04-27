using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexApply.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanySize",
                table: "CompanyProfiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "CompanyProfiles",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "CompanyProfiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Founded",
                table: "CompanyProfiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubUrl",
                table: "CompanyProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                table: "CompanyProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Mission",
                table: "CompanyProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PerksAndBenefits",
                table: "CompanyProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                table: "CompanyProfiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkCulture",
                table: "CompanyProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanySize",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "Founded",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "GitHubUrl",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "Mission",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "PerksAndBenefits",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "Tagline",
                table: "CompanyProfiles");

            migrationBuilder.DropColumn(
                name: "WorkCulture",
                table: "CompanyProfiles");
        }
    }
}

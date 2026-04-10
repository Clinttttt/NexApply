using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexApply.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveJobListingStatusAndAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_JobListings_Status",
                table: "JobListings");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "JobListings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "JobListings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_JobListings_Status",
                table: "JobListings",
                column: "Status");
        }
    }
}

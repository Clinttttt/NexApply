using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexApply.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixJobListingToUserRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobListings_CompanyProfiles_CompanyId",
                table: "JobListings");

            // Update existing data: CompanyId from CompanyProfile.Id to User.Id
            migrationBuilder.Sql(@"
                UPDATE ""JobListings"" j
                SET ""CompanyId"" = cp.""UserId""
                FROM ""CompanyProfiles"" cp
                WHERE j.""CompanyId"" = cp.""Id"";
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_JobListings_Users_CompanyId",
                table: "JobListings",
                column: "CompanyId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobListings_Users_CompanyId",
                table: "JobListings");

            // Revert data: CompanyId from User.Id back to CompanyProfile.Id
            migrationBuilder.Sql(@"
                UPDATE ""JobListings"" j
                SET ""CompanyId"" = cp.""Id""
                FROM ""CompanyProfiles"" cp
                WHERE j.""CompanyId"" = cp.""UserId"";
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_JobListings_CompanyProfiles_CompanyId",
                table: "JobListings",
                column: "CompanyId",
                principalTable: "CompanyProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

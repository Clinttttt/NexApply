using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexApply.Api.Migrations
{
    /// <inheritdoc />
    public partial class Notifications_Upadate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NotificationStates_Applications_ApplicationId",
                table: "NotificationStates");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationStates_JobListings_JobListingId",
                table: "NotificationStates");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationStates_Users_StudentId",
                table: "NotificationStates");

            migrationBuilder.DropIndex(
                name: "IX_NotificationStates_ApplicationId",
                table: "NotificationStates");

            migrationBuilder.DropIndex(
                name: "IX_NotificationStates_CreatedAt",
                table: "NotificationStates");

            migrationBuilder.DropIndex(
                name: "IX_NotificationStates_JobListingId",
                table: "NotificationStates");

            migrationBuilder.DropIndex(
                name: "IX_NotificationStates_StudentId_IsRead",
                table: "NotificationStates");

            migrationBuilder.DropColumn(
                name: "ApplicationId",
                table: "NotificationStates");

            migrationBuilder.DropColumn(
                name: "Body",
                table: "NotificationStates");

            migrationBuilder.DropColumn(
                name: "JobListingId",
                table: "NotificationStates");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "NotificationStates");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "NotificationStates",
                newName: "NotificationId");

            migrationBuilder.AddColumn<bool>(
                name: "IsDismissed",
                table: "NotificationStates",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationStates_StudentId",
                table: "NotificationStates",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationStates_StudentId_NotificationId",
                table: "NotificationStates",
                columns: new[] { "StudentId", "NotificationId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_NotificationStates_StudentId",
                table: "NotificationStates");

            migrationBuilder.DropIndex(
                name: "IX_NotificationStates_StudentId_NotificationId",
                table: "NotificationStates");

            migrationBuilder.DropColumn(
                name: "IsDismissed",
                table: "NotificationStates");

            migrationBuilder.RenameColumn(
                name: "NotificationId",
                table: "NotificationStates",
                newName: "Title");

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationId",
                table: "NotificationStates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Body",
                table: "NotificationStates",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "JobListingId",
                table: "NotificationStates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "NotificationStates",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationStates_ApplicationId",
                table: "NotificationStates",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationStates_CreatedAt",
                table: "NotificationStates",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationStates_JobListingId",
                table: "NotificationStates",
                column: "JobListingId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationStates_StudentId_IsRead",
                table: "NotificationStates",
                columns: new[] { "StudentId", "IsRead" });

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationStates_Applications_ApplicationId",
                table: "NotificationStates",
                column: "ApplicationId",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationStates_JobListings_JobListingId",
                table: "NotificationStates",
                column: "JobListingId",
                principalTable: "JobListings",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationStates_Users_StudentId",
                table: "NotificationStates",
                column: "StudentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

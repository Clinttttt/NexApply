using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexApply.Api.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyResumeArchitecture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Educations_StudentProfiles_StudentProfileId",
                table: "Educations");

            migrationBuilder.DropForeignKey(
                name: "FK_ResumeContents_StudentProfiles_StudentProfileId",
                table: "ResumeContents");

            migrationBuilder.DropForeignKey(
                name: "FK_Skills_StudentProfiles_StudentProfileId",
                table: "Skills");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkExperiences_StudentProfiles_StudentProfileId",
                table: "WorkExperiences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkExperiences",
                table: "WorkExperiences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Skills",
                table: "Skills");

            migrationBuilder.DropIndex(
                name: "IX_Skills_StudentProfileId_Name",
                table: "Skills");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ResumeContents",
                table: "ResumeContents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Educations",
                table: "Educations");

            migrationBuilder.RenameTable(
                name: "WorkExperiences",
                newName: "WorkExperience");

            migrationBuilder.RenameTable(
                name: "Skills",
                newName: "Skill");

            migrationBuilder.RenameTable(
                name: "ResumeContents",
                newName: "ResumeContent");

            migrationBuilder.RenameTable(
                name: "Educations",
                newName: "Education");

            migrationBuilder.RenameIndex(
                name: "IX_WorkExperiences_StudentProfileId",
                table: "WorkExperience",
                newName: "IX_WorkExperience_StudentProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_ResumeContents_StudentProfileId",
                table: "ResumeContent",
                newName: "IX_ResumeContent_StudentProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_Educations_StudentProfileId",
                table: "Education",
                newName: "IX_Education_StudentProfileId");

            migrationBuilder.AlterColumn<string>(
                name: "Position",
                table: "WorkExperience",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "WorkExperience",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Company",
                table: "WorkExperience",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Skill",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Headline",
                table: "ResumeContent",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Institution",
                table: "Education",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Field",
                table: "Education",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Degree",
                table: "Education",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkExperience",
                table: "WorkExperience",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Skill",
                table: "Skill",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ResumeContent",
                table: "ResumeContent",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Education",
                table: "Education",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Resumes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Headline = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AboutMe = table.Column<string>(type: "text", nullable: true),
                    EducationJson = table.Column<string>(type: "text", nullable: false),
                    WorkExperienceJson = table.Column<string>(type: "text", nullable: false),
                    SkillsJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resumes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resumes_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Skill_StudentProfileId",
                table: "Skill",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Resumes_StudentProfileId",
                table: "Resumes",
                column: "StudentProfileId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Education_StudentProfiles_StudentProfileId",
                table: "Education",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ResumeContent_StudentProfiles_StudentProfileId",
                table: "ResumeContent",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Skill_StudentProfiles_StudentProfileId",
                table: "Skill",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkExperience_StudentProfiles_StudentProfileId",
                table: "WorkExperience",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Education_StudentProfiles_StudentProfileId",
                table: "Education");

            migrationBuilder.DropForeignKey(
                name: "FK_ResumeContent_StudentProfiles_StudentProfileId",
                table: "ResumeContent");

            migrationBuilder.DropForeignKey(
                name: "FK_Skill_StudentProfiles_StudentProfileId",
                table: "Skill");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkExperience_StudentProfiles_StudentProfileId",
                table: "WorkExperience");

            migrationBuilder.DropTable(
                name: "Resumes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkExperience",
                table: "WorkExperience");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Skill",
                table: "Skill");

            migrationBuilder.DropIndex(
                name: "IX_Skill_StudentProfileId",
                table: "Skill");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ResumeContent",
                table: "ResumeContent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Education",
                table: "Education");

            migrationBuilder.RenameTable(
                name: "WorkExperience",
                newName: "WorkExperiences");

            migrationBuilder.RenameTable(
                name: "Skill",
                newName: "Skills");

            migrationBuilder.RenameTable(
                name: "ResumeContent",
                newName: "ResumeContents");

            migrationBuilder.RenameTable(
                name: "Education",
                newName: "Educations");

            migrationBuilder.RenameIndex(
                name: "IX_WorkExperience_StudentProfileId",
                table: "WorkExperiences",
                newName: "IX_WorkExperiences_StudentProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_ResumeContent_StudentProfileId",
                table: "ResumeContents",
                newName: "IX_ResumeContents_StudentProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_Education_StudentProfileId",
                table: "Educations",
                newName: "IX_Educations_StudentProfileId");

            migrationBuilder.AlterColumn<string>(
                name: "Position",
                table: "WorkExperiences",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "WorkExperiences",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Company",
                table: "WorkExperiences",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Skills",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Headline",
                table: "ResumeContents",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Institution",
                table: "Educations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Field",
                table: "Educations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Degree",
                table: "Educations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkExperiences",
                table: "WorkExperiences",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Skills",
                table: "Skills",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ResumeContents",
                table: "ResumeContents",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Educations",
                table: "Educations",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_StudentProfileId_Name",
                table: "Skills",
                columns: new[] { "StudentProfileId", "Name" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Educations_StudentProfiles_StudentProfileId",
                table: "Educations",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ResumeContents_StudentProfiles_StudentProfileId",
                table: "ResumeContents",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Skills_StudentProfiles_StudentProfileId",
                table: "Skills",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkExperiences_StudentProfiles_StudentProfileId",
                table: "WorkExperiences",
                column: "StudentProfileId",
                principalTable: "StudentProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

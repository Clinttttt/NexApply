using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexApply.Api.Migrations
{
    /// <inheritdoc />
    public partial class ConvertEnumsToIntegers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop default constraints first
            migrationBuilder.Sql(@"ALTER TABLE ""JobListings"" ALTER COLUMN ""JobType"" DROP DEFAULT;");
            migrationBuilder.Sql(@"ALTER TABLE ""JobListings"" ALTER COLUMN ""WorkSetup"" DROP DEFAULT;");
            migrationBuilder.Sql(@"ALTER TABLE ""JobListings"" ALTER COLUMN ""Status"" DROP DEFAULT;");
            migrationBuilder.Sql(@"ALTER TABLE ""Applications"" ALTER COLUMN ""Status"" DROP DEFAULT;");

            // Convert JobListings enums from string to integer
            migrationBuilder.Sql(@"
                ALTER TABLE ""JobListings"" 
                ALTER COLUMN ""JobType"" TYPE integer USING 
                    CASE ""JobType""
                        WHEN 'FullTime' THEN 0
                        WHEN 'PartTime' THEN 1
                        WHEN 'Internship' THEN 2
                        WHEN 'Freelance' THEN 3
                        WHEN 'Remote' THEN 4
                        ELSE 0
                    END;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE ""JobListings"" 
                ALTER COLUMN ""WorkSetup"" TYPE integer USING 
                    CASE ""WorkSetup""
                        WHEN 'OnSite' THEN 0
                        WHEN 'Remote' THEN 1
                        WHEN 'Hybrid' THEN 2
                        ELSE 0
                    END;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE ""JobListings"" 
                ALTER COLUMN ""Status"" TYPE integer USING 
                    CASE ""Status""
                        WHEN 'Active' THEN 0
                        WHEN 'Paused' THEN 1
                        WHEN 'Closed' THEN 2
                        ELSE 0
                    END;
            ");

            // Convert Applications.Status from string to integer
            migrationBuilder.Sql(@"
                ALTER TABLE ""Applications"" 
                ALTER COLUMN ""Status"" TYPE integer USING 
                    CASE ""Status""
                        WHEN 'Submitted' THEN 0
                        WHEN 'UnderReview' THEN 1
                        WHEN 'Shortlisted' THEN 2
                        WHEN 'ForInterview' THEN 3
                        WHEN 'Declined' THEN 4
                        ELSE 0
                    END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert JobListings enums from integer to string
            migrationBuilder.Sql(@"
                ALTER TABLE ""JobListings"" 
                ALTER COLUMN ""JobType"" TYPE character varying(20) USING 
                    CASE ""JobType""
                        WHEN 0 THEN 'FullTime'
                        WHEN 1 THEN 'PartTime'
                        WHEN 2 THEN 'Internship'
                        WHEN 3 THEN 'Freelance'
                        WHEN 4 THEN 'Remote'
                        ELSE 'FullTime'
                    END;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE ""JobListings"" 
                ALTER COLUMN ""WorkSetup"" TYPE character varying(20) USING 
                    CASE ""WorkSetup""
                        WHEN 0 THEN 'OnSite'
                        WHEN 1 THEN 'Remote'
                        WHEN 2 THEN 'Hybrid'
                        ELSE 'OnSite'
                    END;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE ""JobListings"" 
                ALTER COLUMN ""Status"" TYPE character varying(20) USING 
                    CASE ""Status""
                        WHEN 0 THEN 'Active'
                        WHEN 1 THEN 'Paused'
                        WHEN 2 THEN 'Closed'
                        ELSE 'Active'
                    END;
            ");

            // Revert Applications.Status from integer to string
            migrationBuilder.Sql(@"
                ALTER TABLE ""Applications"" 
                ALTER COLUMN ""Status"" TYPE character varying(20) USING 
                    CASE ""Status""
                        WHEN 0 THEN 'Submitted'
                        WHEN 1 THEN 'UnderReview'
                        WHEN 2 THEN 'Shortlisted'
                        WHEN 3 THEN 'ForInterview'
                        WHEN 4 THEN 'Declined'
                        ELSE 'Submitted'
                    END;
            ");
        }
    }
}

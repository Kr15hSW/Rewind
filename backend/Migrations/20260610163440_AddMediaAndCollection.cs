using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RewindAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaAndCollection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "media_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    external_id = table.Column<string>(type: "text", nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    cover_url = table.Column<string>(type: "text", nullable: true),
                    release_year = table.Column<int>(type: "integer", nullable: true),
                    genres = table.Column<string[]>(type: "text[]", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_media_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "book_details",
                columns: table => new
                {
                    media_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author = table.Column<string>(type: "text", nullable: true),
                    publisher = table.Column<string>(type: "text", nullable: true),
                    pages = table.Column<int>(type: "integer", nullable: true),
                    isbn = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_book_details", x => x.media_item_id);
                    table.ForeignKey(
                        name: "FK_book_details_media_items_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_details",
                columns: table => new
                {
                    media_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    developer = table.Column<string>(type: "text", nullable: true),
                    publisher = table.Column<string>(type: "text", nullable: true),
                    platforms = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_details", x => x.media_item_id);
                    table.ForeignKey(
                        name: "FK_game_details_media_items_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "movie_details",
                columns: table => new
                {
                    media_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    director = table.Column<string>(type: "text", nullable: true),
                    duration_minutes = table.Column<int>(type: "integer", nullable: true),
                    original_language = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movie_details", x => x.media_item_id);
                    table.ForeignKey(
                        name: "FK_movie_details_media_items_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "series_details",
                columns: table => new
                {
                    media_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    creator = table.Column<string>(type: "text", nullable: true),
                    total_seasons = table.Column<int>(type: "integer", nullable: true),
                    total_episodes = table.Column<int>(type: "integer", nullable: true),
                    series_status = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_series_details", x => x.media_item_id);
                    table.ForeignKey(
                        name: "FK_series_details_media_items_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_collection",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: true),
                    review = table.Column<string>(type: "text", nullable: true),
                    platform_played = table.Column<string>(type: "text", nullable: true),
                    added_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_collection", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_collection_media_items_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_collection_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_media_items_external_id",
                table: "media_items",
                column: "external_id");

            migrationBuilder.CreateIndex(
                name: "IX_media_items_type",
                table: "media_items",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "IX_user_collection_media_item_id",
                table: "user_collection",
                column: "media_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_collection_user_id_media_item_id",
                table: "user_collection",
                columns: new[] { "user_id", "media_item_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "book_details");

            migrationBuilder.DropTable(
                name: "game_details");

            migrationBuilder.DropTable(
                name: "movie_details");

            migrationBuilder.DropTable(
                name: "series_details");

            migrationBuilder.DropTable(
                name: "user_collection");

            migrationBuilder.DropTable(
                name: "media_items");
        }
    }
}

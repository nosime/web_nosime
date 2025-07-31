
-- Bật hỗ trợ tiếng Việt
ALTER DATABASE MovieDB COLLATE Vietnamese_CI_AS
GO

-- Tạo các bảng trong database
-- Bảng danh mục phim
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    DisplayOrder INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Bảng quốc gia
CREATE TABLE Countries (
    CountryID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(100) NOT NULL UNIQUE,
    Code VARCHAR(10),
    IsActive BIT DEFAULT 1
);
GO



-- Bảng phim
CREATE TABLE Movies (
    MovieID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    OriginName NVARCHAR(255),
    Slug NVARCHAR(255) NOT NULL UNIQUE,
    Description NVARCHAR(MAX),
    Content NVARCHAR(MAX),
    Type VARCHAR(20) CHECK (Type IN ('single', 'series')),
    Status VARCHAR(20) CHECK (Status IN ('completed', 'ongoing', 'trailer')),
    ThumbUrl NVARCHAR(500),
    PosterUrl NVARCHAR(500),
    BannerUrl NVARCHAR(500),
    TrailerUrl NVARCHAR(500),
    Duration INT, -- Thời lượng tính bằng phút
    Episode_Current VARCHAR(50), -- Số tập hiện tại (phim bộ)
    Episode_Total INT, -- Tổng số tập (phim bộ)
    Quality VARCHAR(20),
    Language NVARCHAR(50),
    Year INT,
    Actors NVARCHAR(MAX), -- Cột mới: Danh sách diễn viên
    Directors NVARCHAR(MAX), -- Cột mới: Danh sách đạo diễn
    IsCopyright BIT DEFAULT 0,
    IsSubtitled BIT DEFAULT 0,
    IsPremium BIT DEFAULT 0,
    IsVisible BIT DEFAULT 1,
    Views INT DEFAULT 0,
    ViewsDay INT DEFAULT 0, -- Lượt xem trong ngày
    ViewsWeek INT DEFAULT 0, -- Lượt xem trong tuần
    ViewsMonth INT DEFAULT 0, -- Lượt xem trong tháng
    Rating_Value DECIMAL(3,1) DEFAULT 0, -- Điểm đánh giá trung bình
    Rating_Count INT DEFAULT 0, -- Số lượt đánh giá
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    PublishedAt DATETIME,
    -- TMDB Info
    TmdbId VARCHAR(50),
    ImdbId VARCHAR(50),
    TmdbRating DECIMAL(3,1),
    TmdbVoteCount INT
);
GO

-- Bảng liên kết phim-danh mục
CREATE TABLE MovieCategories (
    MovieID INT,
    CategoryID INT,
    PRIMARY KEY (MovieID, CategoryID),
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE
);
GO

-- Bảng liên kết phim-quốc gia
CREATE TABLE MovieCountries (
    MovieID INT,
    CountryID INT,
    PRIMARY KEY (MovieID, CountryID),
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    FOREIGN KEY (CountryID) REFERENCES Countries(CountryID) ON DELETE CASCADE
);
GO


-- Bảng server phát phim
CREATE TABLE Servers (
    ServerID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Type VARCHAR(20), -- cdn, direct, embed
    Priority INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Bảng tập phim
CREATE TABLE Episodes (
    EpisodeID INT PRIMARY KEY IDENTITY(1,1),
    MovieID INT,
    ServerID INT,
    Name NVARCHAR(255),
    Slug NVARCHAR(255),
    FileName NVARCHAR(500),
    EpisodeNumber INT,
    Duration INT, -- Thời lượng tính bằng giây
    VideoUrl NVARCHAR(500),
    EmbedUrl NVARCHAR(500),
    ThumbnailUrl NVARCHAR(500),
    Views INT DEFAULT 0,
    Size BIGINT, -- Kích thước file (bytes)
    Quality VARCHAR(20),
    IsProcessed BIT DEFAULT 0, -- Đánh dấu đã xử lý xong
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    FOREIGN KEY (ServerID) REFERENCES Servers(ServerID)
);
GO

-- Bảng Roles (Vai trò người dùng)
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Bảng Permissions (Quyền hạn)
CREATE TABLE Permissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Code VARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Bảng phân quyền cho vai trò
CREATE TABLE RolePermissions (
    RoleID INT,
    PermissionID INT,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID) ON DELETE CASCADE
);
GO

-- Bảng Users
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL, -- Đã hash
    DisplayName NVARCHAR(100),
    Avatar NVARCHAR(500),
    CoverPhoto NVARCHAR(500),
    Bio NVARCHAR(500),
    Gender VARCHAR(10),
    Birthday DATE,
    PhoneNumber VARCHAR(20),
    Address NVARCHAR(255),
    IsVerified BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    IsPremium BIT DEFAULT 0,
    PremiumExpireDate DATETIME,
    LastLoginAt DATETIME,
    LastLoginIP VARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Bảng liên kết user với vai trò
CREATE TABLE UserRoles (
    UserID INT,
    RoleID INT,
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE
);
GO

-- Bảng lịch sử xem phim
CREATE TABLE ViewHistory (
    HistoryID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    MovieID INT,
    EpisodeID INT,
    ServerID INT,
    ViewDate DATETIME DEFAULT GETDATE(),
    ViewDuration INT, -- Thời gian xem (giây)
    LastPosition INT, -- Vị trí xem cuối (giây)
    Completed BIT DEFAULT 0, -- Đã xem hết chưa
    DeviceType VARCHAR(50), -- Loại thiết bị xem
    DeviceID VARCHAR(100), -- ID thiết bị
    IPAddress VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE NO ACTION,
    FOREIGN KEY (EpisodeID) REFERENCES Episodes(EpisodeID) ON DELETE NO ACTION,
    FOREIGN KEY (ServerID) REFERENCES Servers(ServerID) ON DELETE NO ACTION
);
GO

-- Bảng danh sách xem sau
CREATE TABLE WatchLater (
    WatchLaterID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    MovieID INT,
    AddedDate DATETIME DEFAULT GETDATE(),
    Priority INT DEFAULT 0,
    Notes NVARCHAR(500),
    RemindAt DATETIME, -- Thời gian nhắc nhở
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE
);
GO

-- Bảng đánh giá phim
CREATE TABLE MovieRatings (
    RatingID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    MovieID INT,
    Score INT CHECK (Score BETWEEN 1 AND 10),
    RatingType VARCHAR(20) CHECK (RatingType IN ('like', 'dislike', 'awesome')),
    Comment NVARCHAR(1000),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    CONSTRAINT UC_UserMovie UNIQUE (UserID, MovieID)
);
GO

-- Thêm các index để tối ưu hiệu suất truy vấn
CREATE INDEX idx_movie_slug ON Movies(Slug);
CREATE INDEX idx_movie_year ON Movies(Year);
CREATE INDEX idx_movie_views ON Movies(Views);
CREATE INDEX idx_episode_movie ON Episodes(MovieID);
CREATE INDEX idx_history_user ON ViewHistory(UserID);
CREATE INDEX idx_history_movie ON ViewHistory(MovieID);
CREATE INDEX idx_watchlater_user ON WatchLater(UserID);
CREATE INDEX idx_rating_movie ON MovieRatings(MovieID);
CREATE INDEX idx_viewhistory_movie_episode ON ViewHistory(MovieID, EpisodeID);
CREATE INDEX idx_viewhistory_user_date ON ViewHistory(UserID, ViewDate);
GO

-- Xóa dữ liệu cũ nếu có
DELETE FROM RolePermissions;
DELETE FROM Permissions;
DELETE FROM Roles;
GO

-- Thêm lại dữ liệu với NVARCHAR và N prefix cho tiếng Việt
SET IDENTITY_INSERT Permissions ON;
INSERT INTO Permissions (PermissionID, Name, Code, Description, IsActive) VALUES
(1, N'Xem Phim', 'VIEW_MOVIE', N'Quyền xem phim', 1),
(2, N'Thêm Phim', 'ADD_MOVIE', N'Quyền thêm phim mới', 1),
(3, N'Sửa Phim', 'EDIT_MOVIE', N'Quyền sửa thông tin phim', 1),
(4, N'Xóa Phim', 'DELETE_MOVIE', N'Quyền xóa phim', 1),
(5, N'Quản Lý Users', 'MANAGE_USERS', N'Quyền quản lý người dùng', 1),
(6, N'Full Quyền', 'FULL_CONTROL', N'Toàn quyền quản lý hệ thống', 1);
SET IDENTITY_INSERT Permissions OFF;
GO

SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (RoleID, Name, Description, IsActive) VALUES
(1, N'Admin', N'Quản trị viên - Full quyền', 1),
(2, N'Manager', N'Quản lý - Quyền thêm, sửa, xóa', 1),
(3, N'Editor', N'Biên tập viên - Quyền thêm và sửa', 1),
(4, N'Moderator', N'Điều hành viên - Quyền xem và thêm', 1),
(5, N'Member', N'Thành viên - Chỉ có quyền xem', 1);
SET IDENTITY_INSERT Roles OFF;
GO

-- Phân quyền cho các vai trò
-- Editor - Quyền thêm và sửa
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES
(3, 1), -- Editor - Xem phim
(3, 2), -- Editor - Thêm phim
(3, 3); -- Editor - Sửa phim
GO

-- Manager - Quyền thêm, sửa, xóa
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES
(2, 1), -- Manager - Xem phim
(2, 2), -- Manager - Thêm phim
(2, 3), -- Manager - Sửa phim
(2, 4); -- Manager - Xóa phim
GO

-- Member - Chỉ quyền xem
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES
(5, 1); -- Member - Xem phim
GO

-- Admin - Full quyền
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 1, PermissionID FROM Permissions;
GO

-- Moderator - Quyền xem và thêm
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES
(4, 1), -- Moderator - Xem phim
(4, 2); -- Moderator - Thêm phim
GO

-- Tạo store procedure để thêm admin với hash password
CREATE PROCEDURE CreateAdminUser 
AS
BEGIN
    DECLARE @AdminUserID INT;
    
    INSERT INTO Users (Username, Email, Password, DisplayName, IsVerified, IsActive)
    VALUES ('admin', 'admin@nosime.com', '$2a$10$vpXRod9vrfDasnnxVE5uPO9yFmq/wYxwsqi09q03/v4dFSgBauV5G', 'Admin', 1, 1);
    
    SET @AdminUserID = SCOPE_IDENTITY();
    INSERT INTO UserRoles (UserID, RoleID) VALUES (@AdminUserID, 1);
END
GO

-- Chạy procedure
EXEC CreateAdminUser;
GO
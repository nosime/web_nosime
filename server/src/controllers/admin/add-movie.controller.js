const sql = require('mssql');
const db = require('../../../database/database');

class AddMovieController {
  async addMovie(req, res) {
    let pool;
    try {
        const {
            Name,
            OriginName,
            Description,
            Type,
            Status,
            ThumbUrl,
            PosterUrl,
            TrailerUrl,
            Year,
            Language,
            Actors,
            Directors,
            Categories,
            Countries,
            Quality  
          } = req.body;
    
      // Log dữ liệu nhận được
      console.log('Received data:', {
        Categories,
        Countries
      });

      // Validate dữ liệu đầu vào
      if (!Name || !OriginName || !Description || !Quality) { // Thêm kiểm tra Quality
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc'
        });
      }

      pool = await db.getConnection();
      
      // Bắt đầu transaction
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        // 1. Tạo slug từ tên phim
        const slug = createSlug(Name);
        
        // Kiểm tra slug đã tồn tại chưa
        const checkSlug = await transaction.request()
          .input('Slug', sql.NVarChar, slug)
          .query('SELECT MovieID FROM Movies WHERE Slug = @Slug');
        
        if (checkSlug.recordset.length > 0) {
          throw new Error('Phim đã tồn tại');
        }

        // 2. Thêm phim mới
        const movieResult = await transaction.request()
        .input('Name', sql.NVarChar, Name)
        .input('OriginName', sql.NVarChar, OriginName)
        .input('Slug', sql.NVarChar, slug)
        .input('Description', sql.NVarChar(sql.MAX), Description)
        .input('Type', sql.VarChar(20), Type)
        .input('Status', sql.VarChar(20), Status)
        .input('ThumbUrl', sql.NVarChar(500), ThumbUrl)
        .input('PosterUrl', sql.NVarChar(500), PosterUrl)
        .input('TrailerUrl', sql.NVarChar(500), TrailerUrl || null)
        .input('Year', sql.Int, Year)
        .input('Language', sql.NVarChar(50), Language)
        .input('Quality', sql.VarChar(20), Quality) // Thêm input Quality
        .input('Actors', sql.NVarChar(sql.MAX), Actors || '')
        .input('Directors', sql.NVarChar(sql.MAX), Directors || '')
        .input('IsVisible', sql.Bit, 1)
        .query(`
          INSERT INTO Movies (
            Name, OriginName, Slug, Description, 
            Type, Status, ThumbUrl, PosterUrl, 
            TrailerUrl, Year, Language, Quality, Actors, 
            Directors, IsVisible, CreatedAt, UpdatedAt
          )
          VALUES (
            @Name, @OriginName, @Slug, @Description,
            @Type, @Status, @ThumbUrl, @PosterUrl,
            @TrailerUrl, @Year, @Language, @Quality, @Actors,
            @Directors, @IsVisible, GETDATE(), GETDATE()
          );
          SELECT SCOPE_IDENTITY() as MovieID;
        `);
        const movieId = movieResult.recordset[0].MovieID;

        // 3. Thêm thể loại
        if (Categories && Categories.length > 0) {
          for (const categorySlug of Categories) {
            // Lấy CategoryID từ slug
            const categoryResult = await transaction.request()
              .input('Slug', sql.NVarChar, categorySlug)
              .query('SELECT CategoryID FROM Categories WHERE Slug = @Slug');

            if (categoryResult.recordset.length > 0) {
              const categoryId = categoryResult.recordset[0].CategoryID;
              
              // Thêm vào bảng MovieCategories
              await transaction.request()
                .input('MovieID', sql.Int, movieId)
                .input('CategoryID', sql.Int, categoryId)
                .query('INSERT INTO MovieCategories (MovieID, CategoryID) VALUES (@MovieID, @CategoryID)');
            }
          }
        }

        // 4. Thêm quốc gia
        if (Countries && Countries.length > 0) {
          const countrySlug = Countries[0]; // Lấy quốc gia đầu tiên
          
          const countryResult = await transaction.request()
            .input('Slug', sql.NVarChar, countrySlug)
            .query('SELECT CountryID FROM Countries WHERE Slug = @Slug');

          if (countryResult.recordset.length > 0) {
            const countryId = countryResult.recordset[0].CountryID;
            
            await transaction.request()
              .input('MovieID', sql.Int, movieId)
              .input('CountryID', sql.Int, countryId)
              .query('INSERT INTO MovieCountries (MovieID, CountryID) VALUES (@MovieID, @CountryID)');
          }
        }

        // Commit transaction
        await transaction.commit();

        res.json({
          success: true,
          message: 'Thêm phim thành công',
          data: { movieId, slug }
        });

      } catch (err) {
        await transaction.rollback();
        throw err;
      }

    } catch (error) {
      console.error('Error in addMovie:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi thêm phim'
      });
    } finally {
      if (pool) {
        try {
          await pool.close();
        } catch (err) {
          console.error('Error closing pool:', err);
        }
      }
    }
  }
}


// Helper function tạo slug
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = new AddMovieController();
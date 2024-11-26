const axios = require('axios');
const sql = require('mssql');
const config = require('../../database/config');

// Fetch movie từ API
async function fetchMovieDetails(slug) {
  try {
    const response = await axios.get(`https://ophim1.com/phim/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }
}
// Hàm helper để chuyển đổi category id
const getCategoryId = async (pool, categorySlug) => {
  try {
    const result = await pool.request()
      .input('slug', sql.NVarChar(100), categorySlug)
      .query(`
        SELECT CategoryID 
        FROM Categories 
        WHERE Slug = @slug
      `);
    
    if (result.recordset.length > 0) {
      return result.recordset[0].CategoryID;
    }
    return null;
  } catch (error) {
    console.error('Error getting category ID:', error);
    throw error;
  }
};

// Hàm helper để chuyển đổi country id
const getCountryId = async (pool, countrySlug) => {
  try {
    const result = await pool.request()
      .input('slug', sql.NVarChar(100), countrySlug)
      .query(`
        SELECT CountryID 
        FROM Countries 
        WHERE Slug = @slug
      `);
    
    if (result.recordset.length > 0) {
      return result.recordset[0].CountryID;
    }
    return null;
  } catch (error) {
    console.error('Error getting country ID:', error);
    throw error;
  }
};

// Helper function để xử lý URL
function validateAndTruncateUrl(url, maxLength = 450) {
  if (!url) return null;
  
  try {
    // Chuẩn hóa URL
    let processedUrl = url.trim();
    
    // Kiểm tra độ dài và cắt nếu cần
    if (processedUrl.length > maxLength) {
      console.warn(`URL too long (${processedUrl.length} chars), truncating to ${maxLength} chars`);
      processedUrl = processedUrl.substring(0, maxLength);
    }

    return processedUrl;
  } catch (error) {
    console.error('Error processing URL:', error);
    return null;
  }
}

// Sửa lại hàm insertMovie
async function insertMovie(movie, pool) {
  try {
    // Parse episode numbers
    let episodeCurrent = null;
    if (movie.episode_current) {
      const match = movie.episode_current.match(/\d+/);
      if (match) {
        episodeCurrent = parseInt(match[0]);
      }
    }
    
    let episodeTotal = null;
    if (movie.episode_total) {
      const match = movie.episode_total.match(/\d+/);
      if (match) {
        episodeTotal = parseInt(match[0]);
      }
    }

    // Xử lý actors và directors
    const actors = Array.isArray(movie.actor) ? movie.actor.join(', ') : '';
    const directors = Array.isArray(movie.director) ? movie.director.join(', ') : '';

    // Validate và chuẩn hóa URLs
    const thumbUrl = validateAndTruncateUrl(movie.thumb_url);
    const posterUrl = validateAndTruncateUrl(movie.poster_url);
    const trailerUrl = validateAndTruncateUrl(movie.trailer_url);

    // Map type từ API sang định dạng DB
    let movieType = 'single';
    if (movie.type === 'series') {
      movieType = 'series';
    }

    const result = await pool.request()
      .input('Name', sql.NVarChar(255), movie.name)
      .input('OriginName', sql.NVarChar(255), movie.origin_name)
      .input('Slug', sql.NVarChar(255), movie.slug)
      .input('Description', sql.NVarChar(sql.MAX), movie.content)
      .input('Type', sql.VarChar(20), movieType)
      .input('Status', sql.VarChar(20), movie.status || 'ongoing')
      .input('ThumbUrl', sql.NVarChar(500), thumbUrl)
      .input('PosterUrl', sql.NVarChar(500), posterUrl)
      .input('TrailerUrl', sql.NVarChar(500), trailerUrl)
      .input('Time', sql.NVarChar(50), movie.time)
      .input('EpisodeCurrent', sql.Int, episodeCurrent)
      .input('EpisodeTotal', sql.Int, episodeTotal)
      .input('Quality', sql.VarChar(20), movie.quality)
      .input('Language', sql.NVarChar(50), movie.lang)
      .input('Year', sql.Int, movie.year)
      .input('Actors', sql.NVarChar(sql.MAX), actors)
      .input('Directors', sql.NVarChar(sql.MAX), directors)
      .input('IsCopyright', sql.Bit, movie.is_copyright || false)
      .input('IsSubtitled', sql.Bit, movie.sub_docquyen || false)
      .input('Views', sql.Int, movie.view || 0)
      .input('TmdbId', sql.VarChar(50), movie.tmdb?.id?.toString())
      .input('ImdbId', sql.VarChar(50), movie.imdb?.id)
      .input('TmdbRating', sql.Decimal(3,1), movie.tmdb?.vote_average || 0)
      .input('TmdbVoteCount', sql.Int, movie.tmdb?.vote_count || 0)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Movies WHERE Slug = @Slug)
          INSERT INTO Movies (
            Name, OriginName, Slug, Description, Type, Status,
            ThumbUrl, PosterUrl, TrailerUrl, Duration,
            Episode_Current, Episode_Total, Quality, Language,
            Year, Actors, Directors, IsCopyright, IsSubtitled, 
            Views, TmdbId, ImdbId, TmdbRating, TmdbVoteCount
          )
          VALUES (
            @Name, @OriginName, @Slug, @Description, @Type, @Status,
            @ThumbUrl, @PosterUrl, @TrailerUrl, NULL,
            @EpisodeCurrent, @EpisodeTotal, @Quality, @Language,
            @Year, @Actors, @Directors, @IsCopyright, @IsSubtitled,
            @Views, @TmdbId, @ImdbId, @TmdbRating, @TmdbVoteCount
          )
        ELSE
          UPDATE Movies
          SET 
            Name = @Name,
            OriginName = @OriginName,
            Description = @Description,
            Type = @Type,
            Status = @Status,
            ThumbUrl = @ThumbUrl,
            PosterUrl = @PosterUrl,
            TrailerUrl = @TrailerUrl,
            Episode_Current = @EpisodeCurrent,
            Episode_Total = @EpisodeTotal,
            Quality = @Quality,
            Language = @Language,
            Year = @Year,
            Actors = @Actors,
            Directors = @Directors,
            IsCopyright = @IsCopyright,
            IsSubtitled = @IsSubtitled,
            Views = @Views,
            TmdbId = @TmdbId,
            ImdbId = @ImdbId,
            TmdbRating = @TmdbRating,
            TmdbVoteCount = @TmdbVoteCount,
            UpdatedAt = GETDATE()
          WHERE Slug = @Slug;
        
        SELECT MovieID FROM Movies WHERE Slug = @Slug;
      `);

    return result.recordset[0].MovieID;
  } catch (error) {
    console.error('Error inserting movie:', error);
    throw error;
  }
}

// Insert/Update categories và countries
// Hàm chính để insert movie relations đã được sửa
async function insertMovieRelations(movieId, movie, pool) {
  try {
    // Clear existing relations first
    await pool.request()
      .input('MovieID', sql.Int, movieId)
      .query(`
        DELETE FROM MovieCategories WHERE MovieID = @MovieID;
        DELETE FROM MovieCountries WHERE MovieID = @MovieID;
      `);

    // Insert categories
    if (movie.category?.length > 0) {
      for (const category of movie.category) {
        const categoryId = await getCategoryId(pool, category.slug);
        if (categoryId) {
          await pool.request()
            .input('MovieID', sql.Int, movieId)
            .input('CategoryID', sql.Int, categoryId)
            .query(`
              INSERT INTO MovieCategories (MovieID, CategoryID)
              VALUES (@MovieID, @CategoryID);
            `);
        }
      }
    }

    // Insert countries
    if (movie.country?.length > 0) {
      for (const country of movie.country) {
        const countryId = await getCountryId(pool, country.slug);
        if (countryId) {
          await pool.request()
            .input('MovieID', sql.Int, movieId)
            .input('CountryID', sql.Int, countryId)
            .query(`
              INSERT INTO MovieCountries (MovieID, CountryID)
              VALUES (@MovieID, @CountryID);
            `);
        }
      }
    }
  } catch (error) {
    console.error('Error inserting movie relations:', error);
    throw error;
  }
}
// Insert/Update server và episodes
async function insertServerAndEpisodes(movieId, episodes, pool) {
  try {
    for (const episodeGroup of episodes) {
      // Insert server
      const serverResult = await pool.request()
        .input('Name', sql.NVarChar(100), episodeGroup.server_name)
        .input('Type', sql.VarChar(20), 'embed')
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Servers WHERE Name = @Name)
            INSERT INTO Servers (Name, Type, Priority)
            VALUES (@Name, @Type, 1);
          SELECT ServerID FROM Servers WHERE Name = @Name;
        `);
      
      const serverId = serverResult.recordset[0].ServerID;

      // Delete existing episodes for this server
      await pool.request()
        .input('MovieID', sql.Int, movieId)
        .input('ServerID', sql.Int, serverId)
        .query(`
          DELETE FROM Episodes 
          WHERE MovieID = @MovieID AND ServerID = @ServerID;
        `);

      // Insert episodes
      for (const episode of episodeGroup.server_data) {
        await pool.request()
          .input('MovieID', sql.Int, movieId)
          .input('ServerID', sql.Int, serverId)
          .input('Name', sql.NVarChar(255), episode.name)
          .input('Slug', sql.NVarChar(255), episode.slug)
          .input('FileName', sql.NVarChar(255), episode.filename)
          .input('EpisodeNumber', sql.Int, parseInt(episode.name))
          .input('VideoUrl', sql.NVarChar(500), episode.link_m3u8)
          .input('EmbedUrl', sql.NVarChar(500), episode.link_embed)
          .query(`
            INSERT INTO Episodes (
              MovieID, ServerID, Name, Slug,FileName,
              EpisodeNumber, VideoUrl, EmbedUrl,
              IsProcessed
            )
            VALUES (
              @MovieID, @ServerID, @Name, @Slug,@FileName,
              @EpisodeNumber, @VideoUrl, @EmbedUrl,
              1
            );
          `);
      }
    }
  } catch (error) {
    console.error('Error inserting server and episodes:', error);
    throw error;
  }
}

// Main sync function
async function syncMovieBySlug(req, res) {
  let pool;
  try {
    pool = await sql.connect(config);

    // Get movie slug
    const { slug } = req.params;
    if (!slug) {
      throw new Error('Movie slug is required');
    }

    // Fetch movie details
    console.log('Fetching movie details...');
    const movieData = await fetchMovieDetails(slug);
    
    if (!movieData.movie) {
      throw new Error('Movie not found');
    }

    // Insert movie
    console.log('Inserting movie...');
    const movieId = await insertMovie(movieData.movie, pool);

    // Insert relations
    console.log('Inserting movie relations...');
    await insertMovieRelations(movieId, movieData.movie, pool);

    // Insert server and episodes
    console.log('Inserting server and episodes...');
    if (movieData.episodes?.length > 0) {
      await insertServerAndEpisodes(movieId, movieData.episodes, pool);
    }

    res.json({
      success: true,
      message: 'Movie synced successfully',
      data: {
        movieId,
        slug,
        episodes: movieData.episodes?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in syncMovieBySlug:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

// Hàm lấy danh sách phim theo trang
async function fetchMovieList(page = 1) {
  try {
    const response = await axios.get(`https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie list page ${page}:`, error);
    throw error;
  }
}

// Hàm delay để tránh gọi API quá nhanh
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Hàm xử lý sync tất cả phim từ API
async function syncAllMovies(req, res) {
  let pool;
  try {
    pool = await sql.connect(config);
    
    const startPage = parseInt(req.query.startPage) || 1;
    const endPage = parseInt(req.query.endPage) || startPage;
    
    const results = {
      success: [],
      failed: [],
      processedPages: 0,
      isStreaming: req.query.stream === 'true'
    };

    // Xử lý từng trang
    for (let page = startPage; page <= endPage; page++) {
      try {
        console.log(`\nProcessing page ${page}/${endPage}`);
        
        const pageData = await fetchMovieList(page);
        
        // Xử lý từng phim
        for (const item of pageData.items) {
          try {
            console.log(`\nSyncing movie: ${item.name} (${item.slug})`);

            // Lấy chi tiết phim
            const movieData = await fetchMovieDetails(item.slug);
            
            if (!movieData.movie) {
              console.log(`No movie data found for ${item.slug}`);
              continue;
            }

            // Insert vào database
            const movieId = await insertMovie(movieData.movie, pool);
            await insertMovieRelations(movieId, movieData.movie, pool);
            
            if (movieData.episodes?.length > 0) {
              await insertServerAndEpisodes(movieId, movieData.episodes, pool);
            }

            results.success.push({
              slug: item.slug,
              name: item.name,
              id: movieId
            });

            // Nếu đang stream thì gửi update
            if (results.isStreaming) {
              res.write(JSON.stringify({
                type: 'progress',
                data: {
                  currentMovie: item.name,
                  success: results.success.length,
                  failed: results.failed.length,
                  currentPage: page,
                  totalPages: endPage - startPage + 1
                }
              }) + '\n');
            }

            // Delay giữa các phim
            await delay(1000);

          } catch (error) {
            console.error(`Error syncing movie ${item.slug}:`, error);
            results.failed.push({
              slug: item.slug,
              name: item.name,
              error: error.message
            });
          }
        }

        results.processedPages++;

        // Delay giữa các trang
        await delay(2000);

      } catch (error) {
        console.error(`Error processing page ${page}:`, error);
        continue; 
      }
    }

    // Kết thúc stream nếu đang streaming
    if (results.isStreaming) {
      res.write(JSON.stringify({
        type: 'complete',
        data: {
          processedPages: results.processedPages,
          totalSuccess: results.success.length,
          totalFailed: results.failed.length,
          results
        }
      }));
      res.end();
    } else {
      // Gửi response một lần duy nhất nếu không stream
      res.json({
        success: true,
        message: 'Completed syncing movies',
        stats: {
          processedPages: results.processedPages,
          totalSuccess: results.success.length, 
          totalFailed: results.failed.length
        },
        results
      });
    }

  } catch (error) {
    console.error('Error in syncAllMovies:', error);
    
    // Chỉ gửi error response nếu chưa bắt đầu stream
    if (!req.query.stream) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

// Thêm vào phần exports
module.exports = {
  syncMovieBySlug,
  syncAllMovies,
  // Thêm các export này
  fetchMovieDetails,
  insertMovie,
  insertMovieRelations,
  insertServerAndEpisodes,
  getCategoryId,
  getCountryId,
  delay,
  fetchMovieList
};
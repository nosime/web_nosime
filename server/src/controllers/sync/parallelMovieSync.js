// parallelMovieSync.js

const {
  fetchMovieDetails,
  insertMovie,
  insertMovieRelations,
  insertServerAndEpisodes,
  getCategoryId,
  getCountryId,
  delay,
  fetchMovieList,
} = require("./movie.controller");

const sql = require("mssql");
const config = require("../../../database/config");

// Hàm tạo connection mới và retry nếu lỗi
async function createConnection(retryCount = 3) {
  for (let i = 0; i < retryCount; i++) {
    try {
      const pool = await sql.connect(config);
      return pool;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      if (i === retryCount - 1) throw error;
      await delay(1000);
    }
  }
}

// Hàm check và reconnect nếu cần
async function ensureConnection(pool) {
  if (!pool) return createConnection();
  try {
    await pool.request().query("SELECT 1");
    return pool;
  } catch (error) {
    console.log("Connection lost, reconnecting...");
    try {
      await pool.close();
    } catch (e) {} // Ignore close errors
    return await createConnection();
  }
}

// Global progress tracking
let globalProgress = {
  totalMovies: 0,
  processedMovies: 0,
  failedMovies: 0,
  activeThreads: 0,
  threadProgress: {},
};

async function processPageRange(startPage, endPage, threadIndex) {
  let pool;
  let threadStats = {
    processedPages: 0,
    processedMovies: 0,
    failedMovies: 0,
    currentPage: startPage,
  };
  globalProgress.threadProgress[threadIndex] = threadStats;

  try {
    pool = await createConnection();
    console.log(
      `Thread ${threadIndex}: Processing pages ${startPage} to ${endPage}`
    );

    for (let page = startPage; page <= endPage; page++) {
      try {
        threadStats.currentPage = page;
        console.log(`Thread ${threadIndex}: Processing page ${page}`);

        // Ensure connection before fetching list
        pool = await ensureConnection(pool);
        const pageData = await fetchMovieList(page);

        // Process each movie
        for (const item of pageData.items) {
          try {
            console.log(`Thread ${threadIndex}: Processing movie ${item.name}`);

            // Ensure connection before each movie
            pool = await ensureConnection(pool);
            const movieData = await fetchMovieDetails(item.slug);

            if (!movieData.movie) {
              console.log(
                `Thread ${threadIndex}: No movie data found for ${item.slug}`
              );
              continue;
            }

            // Database operations with connection check
            try {
              pool = await ensureConnection(pool);
              const movieId = await insertMovie(movieData.movie, pool);

              pool = await ensureConnection(pool);
              await insertMovieRelations(movieId, movieData.movie, pool);

              if (movieData.episodes?.length > 0) {
                pool = await ensureConnection(pool);
                await insertServerAndEpisodes(
                  movieId,
                  movieData.episodes,
                  pool
                );
              }

              threadStats.processedMovies++;
              globalProgress.processedMovies++;
              console.log(
                `Thread ${threadIndex}: Successfully processed movie ${item.name} (${threadStats.processedMovies}/${globalProgress.processedMovies} total)`
              );
            } catch (dbError) {
              console.error(
                `Thread ${threadIndex}: Database error for movie ${item.slug}:`,
                dbError
              );
              threadStats.failedMovies++;
              globalProgress.failedMovies++;
              pool = await createConnection();
              continue;
            }

            await delay(500);
          } catch (error) {
            console.error(
              `Thread ${threadIndex}: Error processing movie ${item.slug}:`,
              error
            );
            threadStats.failedMovies++;
            globalProgress.failedMovies++;
            continue;
          }
        }

        threadStats.processedPages++;
        await delay(1000);
      } catch (error) {
        console.error(
          `Thread ${threadIndex}: Error processing page ${page}:`,
          error
        );
        pool = await createConnection();
        continue;
      }
    }

    console.log(
      `Thread ${threadIndex}: Completed range ${startPage}-${endPage}`
    );
    console.log(`Thread ${threadIndex} Stats:`, threadStats);
  } catch (error) {
    console.error(`Thread ${threadIndex}: Error in thread:`, error);
  } finally {
    try {
      if (pool) await pool.close();
    } catch (e) {}
    delete globalProgress.threadProgress[threadIndex];
    globalProgress.activeThreads--;
  }
}

async function startParallelSync(req, res) {
  try {
    const startPage = parseInt(req.query.startPage) || 1;
    const endPage = parseInt(req.query.endPage) || 100;
    const threadCount = parseInt(req.query.threads) || 5;

    // Reset global progress
    globalProgress = {
      totalMovies: 0,
      processedMovies: 0,
      failedMovies: 0,
      activeThreads: threadCount,
      threadProgress: {},
      startTime: new Date(),
    };

    const threadRanges = [];
    const pagesPerThread = Math.ceil((endPage - startPage + 1) / threadCount);

    for (let i = 0; i < threadCount; i++) {
      const threadStart = startPage + i * pagesPerThread;
      const threadEnd = Math.min(threadStart + pagesPerThread - 1, endPage);
      threadRanges.push({
        start: threadStart,
        end: threadEnd,
      });
    }

    console.log("Starting parallel sync with ranges:", threadRanges);

    // Get first page to estimate total movies
    const firstPage = await fetchMovieList(startPage);
    globalProgress.totalMovies = firstPage.pagination.totalItems;

    res.json({
      success: true,
      message: "Started parallel sync",
      data: {
        threads: threadRanges,
        totalPages: endPage - startPage + 1,
        pagesPerThread,
        estimatedTotalMovies: globalProgress.totalMovies,
      },
    });

    // Process all threads
    await Promise.all(
      threadRanges.map((range, index) =>
        processPageRange(range.start, range.end, index)
      )
    );

    const endTime = new Date();
    const duration = (endTime - globalProgress.startTime) / 1000;

    console.log("All threads completed");
    console.log("Final statistics:", {
      ...globalProgress,
      duration: `${duration} seconds`,
      moviesPerSecond: (globalProgress.processedMovies / duration).toFixed(2),
    });
  } catch (error) {
    console.error("Error in parallel sync:", error);
  }
}

module.exports = {
  startParallelSync,
};

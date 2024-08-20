const pool = require('./pool');

async function getFavTvShows() {
    const { rows } = await pool.query("SELECT * FROM tvShows");
    return rows;
}

async function addTvShow(name, genre, episodes, status, image_url) {
    const query = `
        INSERT INTO tvShows (name, genre, episodes, status, image_url)
        VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [name, genre, episodes, status, image_url]);
}

async function deleteTvShowById(id){
    await pool.query("DELETE FROM tvShows WHERE id = $1", [id]);
}

module.exports = {
    getFavTvShows,
    addTvShow,
    deleteTvShowById
}
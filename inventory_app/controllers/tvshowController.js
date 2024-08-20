const db = require("../db/queries");

async function favAllTvShows(req, res){
    try {
        const tvShows = await db.getFavTvShows();  // Fetch all TV shows from the database
        res.render('tvshows', { tvShows });     // Pass the TV shows data to the EJS view
      } catch (err) {
        console.error("Error fetching TV shows:", err);
        res.status(500).send("Internal Server Error");
      }
}


async function addTvShowGet(req, res) {
  // Render the form to add a new TV show
  res.render('newtvshow', { title: 'Add New TV Show' });
}

async function addTvShowPost(req, res) {
  const { name, genre, episodes, status, image_url } = req.body;
  
  try {
      await db.addTvShow(name, genre, episodes, status, image_url);
      res.redirect('/'); // Redirect to the page that lists all TV shows
  } catch (err) {
      console.error("Error adding TV show:", err);
      res.status(500).send("Internal Server Error");
  }
}

async function toDeleteTvShows(req, res) {
  try {
      const tvShows = await db.getFavTvShows();  // Fetch all TV shows from the database
      res.render('deletetvshow', { tvShows });        // Render the 'delete' view with TV shows data
  } catch (err) {
      console.error("Error fetching TV shows:", err);
      res.status(500).send("Internal Server Error");
  }
}


async function deleteTvShowById(req, res) {
  const { id } = req.params;

  try {
      await db.deleteTvShowById(id);
      res.redirect('/deletetvshows');  // Redirect to the delete page to show updated list
  } catch (err) {
      console.error("Error deleting TV show:", err);
      res.status(500).send("Internal Server Error");
  }
}
 
module.exports = {
    favAllTvShows,
    addTvShowGet,
    addTvShowPost,
    toDeleteTvShows,
    deleteTvShowById
}
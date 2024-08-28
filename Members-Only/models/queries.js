const pool = require('./pool');

async function signUpInfo (firstname, lastname, username,password, ismember, isadmin) {
    try {
        await pool.query(
          "INSERT INTO users ( firstname, lastname, username, password, ismember, isadmin) VALUES ($1, $2, $3, $4, $5, $6)",
          [firstname, lastname, username, password, ismember, isadmin]
        );
      } catch (err) {
        console.error("Error inserting user into database:", err);
        throw err; // Re-throw the error to be handled by the calling function
      }
}

async function getUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function getUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0]; // Assuming usernames are unique
}

async function postInfo(username, content) {
  try {
    const result = await pool.query(
      "INSERT INTO post (username, content) VALUES ($1, $2) RETURNING id",
      [username, content]
    );
    return result.rows[0].id;  // Return the newly created post's id
  } catch (err) {
    console.error("Error inserting post into database:", err);
    throw err; // Re-throw the error to be handled by the calling function
  }
}


async function getAllPosts() {
  try {
    const result = await pool.query("SELECT  id,username, content FROM post ORDER BY id DESC");
    return result.rows;
  } catch (err) {
    console.error("Error fetching posts:", err);
    throw err;
  }
}

async function updateMembershipStatus(username, isMember) {
  try {
    await pool.query(
      "UPDATE users SET ismember = $1 WHERE username = $2",
      [isMember, username]
    );
  } catch (err) {
    console.error("Error updating membership status:", err);
    throw err;
  }
}

async function updateAdminStatus(username, isadmin){
  try {
    await pool.query(
      "UPDATE users SET isadmin = $1 WHERE username = $2",
      [isadmin, username]
    )
  } catch (error) {
    console.error("Error updating admin status in the database:", err);
    throw error;
  }
}

async function deletePostById(postId) {
  try {
    await pool.query(
      "DELETE FROM post WHERE id = $1",
      [postId]
    );
  } catch (err) {
    console.error("Error deleting post from the database:", err);
    throw err;
  }
}


module.exports = {
   signUpInfo,
   getUserById,
   getUserByUsername,
   postInfo,
   getAllPosts,
   updateMembershipStatus,
   updateAdminStatus,
   deletePostById
}

async function fetchPosts() {
    try {
        // Fetch posts from the API
        const response = await fetch("http://localhost:3000/api/posts", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
  
        const data = await response.json();
  
        if (response.ok) {
            renderPosts(data.posts); // Render posts on the page  
        } else {
            console.error("Failed to fetch posts:", data.error);
            document.getElementById("postsContainer").innerHTML = `<p>Error loading posts.</p>`;
        }
    } catch (error) {
        console.error("An error occurred while fetching posts:", error);
        document.getElementById("postsContainer").innerHTML = `<p>Error loading posts.</p>`;
    }
  }

// Function to render posts on the page
function renderPosts(posts) {
    const postsContainer = document.getElementById("container");
  
    // Check if there are any posts
    if (posts.length === 0) {
        postsContainer.innerHTML = `<p>No posts available.</p>`;
        return;
    }
  
    // Clear the container before rendering
    postsContainer.innerHTML = "";
  
     // Filter out posts that are not "published"
     const publishedPosts = posts.filter(post => post.status === "PUBLISHED");
  
     // Check if there are any published posts
     if (publishedPosts.length === 0) {
         postsContainer.innerHTML = `<p>No published posts available.</p>`;
         return;
     }

    // Loop through the posts and create HTML for each post
    publishedPosts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
  
        postElement.innerHTML = `
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" />` : ''}
            <h2>${post.title}</h2>
            <p>${post.content}</p>
        `;
  
        // Append the post element to the container
        postsContainer.appendChild(postElement);
    });

}    


fetchPosts();
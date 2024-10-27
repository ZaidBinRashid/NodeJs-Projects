// Handle Sign-Up Form Submission
const signupForm = document.getElementById("signupForm");
const errorDiv = document.getElementById("signupError");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    errorDiv.innerHTML = "";

    const formData = {
      firstname: document.getElementById("firstname").value.trim(),
      lastname: document.getElementById("lastname").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
    };

    // Client-Side Validation
    if (!formData.firstname || formData.firstname.length < 4) {
      errorDiv.textContent = "First name must be at least 2 characters long";
      return;
    }

    if (!formData.lastname || formData.lastname.length < 4) {
      errorDiv.textContent = "Last name must be at least 2 characters long";
      return;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errorDiv.textContent = "Please enter a valid email";
      return;
    }

    if (formData.password.length < 8) {
      errorDiv.textContent = "Password must be at least 8 characters long";
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      errorDiv.textContent = "Passwords do not match";
      return;
    }

    // If validation passes, make the API call
    try {
      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sign-up successful! Redirecting to login...");
        window.location.href = "../userHtml/login.html"; // Redirect to login page
      } else {
        errorDiv.textContent = data.error || "Sign-up failed";
      }
    } catch (error) {
      errorDiv.textContent = "An error occurred during sign-up";
    }
  });
}

// Handle Log-In Form Submission
const loginForm = document.getElementById("loginForm");
const loginErrorDiv = document.getElementById("loginError");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    loginErrorDiv.innerHTML = ""; // Clear previous errors

    const formData = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };

    // Client-side Validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      loginErrorDiv.textContent = "Please enter a valid email";
      return;
    }

    if (!formData.password) {
      loginErrorDiv.textContent = "Password is required";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the JWT token in localStorage
        localStorage.setItem("token", data.token);

        try {
          // Decode the token using jwt-decode
          const decodedToken = jwt_decode(data.token); // Now using the globally available jwt_decode
          console.log("Decoded Token:", decodedToken);

          const isAdmin = decodedToken.role === "ADMIN"; // Check if the user is admin
          console.log("Is Admin:", isAdmin);

          alert("Login successful!");

          // Redirect based on the role
          if (isAdmin) {
            window.location.href = "../adminHtml/adminPost.html"; // Redirect to admin dashboard
          } else {
            window.location.href = "../userHtml/posts.html"; // Redirect to user dashboard
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          alert("Error processing login.");
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("An error occurred during login");
    }
  });
}

// Handle create post by admin

const createPost = document.getElementById("postForm");
const postErrors = document.getElementById("postError");

if (createPost) {
  createPost.addEventListener("submit", async (e) => {
    e.preventDefault();

    postErrors.innerHTML = ""; // Clear previous errors

    const formData = {
      title: document.getElementById("title").value,
      content: document.getElementById("content").value,
      status: document.getElementById("status").value,
      imageUrl: document.getElementById("image").value,
    };

    // Assuming the token is stored in localStorage after login
    const token = localStorage.getItem('token');

    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add the token to the Authorization header
         },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Post created successfully!");
        // Optionally redirect or clear the form
        createPost.reset(); // Clear the form fields
      } else {
        postErrors.textContent = data.error || "Failed to create post.";
      }
    } catch (error) {
      postErrors.textContent = "An error occurred while creating the post.";
    }
  })

}

//  Get all the posts

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

  // Loop through the posts and create HTML for each post
  posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");

      postElement.innerHTML = `
          ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" />` : ''}
          <h2>${post.title}</h2>
          <p>${post.content}</p>
          <p><strong>Status:</strong> ${post.status}</p>
          <p><strong>Created At:</strong> ${new Date(post.createdAt).toLocaleDateString()}</p>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn" data-id="${post.id}">Delete</button>
      `;

      // Append the post element to the container
      postsContainer.appendChild(postElement);
  });

  // Attach delete event listeners to all delete buttons
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach((button) => {
      button.addEventListener('click', async (event) => {
          const postId = event.target.getAttribute('data-id');
          await deletePost(postId); // Call the delete function
      });
  });
}

// Handle delete post.
async function deletePost(postId) {
  const token = localStorage.getItem('token'); // Get token from localStorage

  try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` // Add token to Authorization header
          }
      });

      const data = await response.json();

      if (response.ok) {
          alert("Post deleted successfully!");
          fetchPosts(); // Refresh the post list after deletion
      } else {
          alert(data.error || "Failed to delete post.");
      }
  } catch (error) {
      console.error("An error occurred while deleting the post:", error);
      alert("An error occurred while deleting the post.");
  }
}



// Call the function to fetch and render the posts
fetchPosts();


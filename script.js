document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const commentsContainer = document.getElementById('comments-container');
    const API_URL = '/api/comments'; // Define this more robustly if backend is on a different port/domain

    // Function to fetch and display comments
    const fetchComments = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const comments = await response.json();
            renderComments(comments);
        } catch (error) {
            console.error("Could not fetch comments:", error);
            commentsContainer.innerHTML = '<p>Error loading comments. Please try again later.</p>';
        }
    };

    // Function to render comments in the DOM
    const renderComments = (comments) => {
        commentsContainer.innerHTML = ''; // Clear existing comments
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            return;
        }

        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Show newest first

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');

            const profilePic = comment.profile || 'https://via.placeholder.com/50?text=User'; // Default placeholder

            commentElement.innerHTML = `
                <img src="${profilePic}" alt="${comment.name}'s profile picture" class="comment-profile-pic">
                <div class="comment-content">
                    <p class="comment-author">${escapeHTML(comment.name)}</p>
                    <p class="comment-timestamp">${new Date(comment.timestamp).toLocaleString()}</p>
                    <p class="comment-message">${escapeHTML(comment.message)}</p>
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    };

    // Function to handle form submission
    const handleFormSubmit = async (event) => {
        event.preventDefault(); // Prevent default page reload

        const name = document.getElementById('name').value.trim();
        const message = document.getElementById('message').value.trim();
        const profile = document.getElementById('profile').value.trim();

        if (!name || !message) {
            alert('Name and message are required.');
            return;
        }

        const newComment = {
            name,
            message,
            profile: profile || null, // Send null if empty, backend can handle default
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newComment),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Clear the form
            commentForm.reset();
            // Refresh comments
            fetchComments();
        } catch (error) {
            console.error("Could not submit comment:", error);
            alert('Failed to submit comment. Please try again.');
        }
    };

    // Helper function to escape HTML to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Attach event listener to the form
    if (commentForm) {
        commentForm.addEventListener('submit', handleFormSubmit);
    }

    // Initial fetch of comments
    fetchComments();
});

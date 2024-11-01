import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showNewPostForm);
    document.getElementById('cancelBtn').addEventListener('click', hideNewPostForm);
    document.getElementById('postForm').addEventListener('submit', handleSubmit);

    // Load initial posts
    await loadPosts();
});

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
    document.getElementById('newPostBtn').classList.add('hidden');
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
    document.getElementById('newPostBtn').classList.remove('hidden');
    resetForm();
}

function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    quill.setContents([]);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const body = quill.root.innerHTML;

    showLoading();

    try {
        await backend.createPost(title, body, author);
        hideNewPostForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        hideLoading();
    }
}

async function loadPosts() {
    showLoading();
    
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Failed to load posts. Please refresh the page.');
    } finally {
        hideLoading();
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const date = new Date(Number(post.timestamp) / 1000000); // Convert nanoseconds to milliseconds
        
        const article = document.createElement('article');
        article.className = 'post';
        article.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${date.toLocaleDateString()}</span>
            </div>
            <div class="post-content">${post.body}</div>
        `;
        
        postsContainer.appendChild(article);
    });
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

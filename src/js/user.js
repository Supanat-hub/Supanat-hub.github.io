// Get the access token from LocalStorage
const accessToken = localStorage.getItem('accessToken');

if (accessToken) {
    // Fetch user profile including photo
    fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(profileData => {
        const profilePicUrl = profileData.photos && profileData.photos[0] ? profileData.photos[0].url : '/img/account.svg';

        // Display the profile picture or default image
        document.getElementById("profileImage").src = profilePicUrl;
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        // Use default image if error occurs
        document.getElementById("profileImage").src = '/img/account.svg';
    });
} else {
    console.log('No access token found. Using guest account.');
    
    // Set profile image to default and display modal
    document.getElementById("profileImage").src = '/img/account.svg';

    // Show modal to inform the user they need to log in
    const loginModal = document.createElement('div');
    loginModal.classList.add('modal');
    loginModal.innerHTML = `
        <div class="modal-content">
            <h2>กรุณาล็อกอินก่อนใช้งาน</h2>
            <button onclick="redirectToLogin()">ล็อกอิน</button>
        </div>
    `;
    document.body.appendChild(loginModal);

    // Function to redirect to the login page
    function redirectToLogin() {
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?scope=profile&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=token";
    }
}

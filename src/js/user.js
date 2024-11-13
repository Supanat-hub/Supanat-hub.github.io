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

    // Set profile image to default
    document.getElementById("profileImage").src = '/img/account.svg';

    // Create and display the login modal
    const loginModal = document.createElement('div');
    loginModal.classList.add('modal');
    loginModal.style.display = 'flex';
    loginModal.innerHTML = `
        <div class="modal-content">
            <h2>กรุณาล็อกอินก่อนใช้งาน</h2>
            <button onclick="redirectToLogin()">ล็อกอิน</button>
        </div>
    `;
    document.body.appendChild(loginModal);

    // Function to redirect to the login page
    function redirectToLogin() {
        const clientId = '71156426726-oslpb03c1vcnepuaup0tsds8d7sopgm2.apps.googleusercontent.com';
        const redirectUri = 'https://supanat-hub.github.io/callback';
        const scope = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile';// หรือ scope ที่ต้องการ

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        window.location.href = authUrl;
    }
}

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
        const profilePicUrl = profileData.photos && profileData.photos[0] ? profileData.photos[0].url : null;

        // If no profile pic found, use a default image
        document.getElementById("profileImage").src = profilePicUrl || '/img/account.svg';
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        // Use default image if error occurs
        document.getElementById("profileImage").src = '/img/account.svg';
    });
} else {
    console.log('No access token found.');
    console.log('use gust acc.');
    document.getElementById("profileImage").src = '/img/account.svg';
}
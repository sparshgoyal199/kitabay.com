/*async function convertImageToFile(imageUrl, fileName) {
    // Fetch the image data
    const response = await fetch(imageUrl);
    // Convert the response to a Blob
    const blob = await response.blob();
    // Create a File object from the Blob
    const file = new File([blob], fileName, { type: blob.type });
    return file;
}

// Example usage
const imageUrl = 'C:/Users/spars/OneDrive/Desktop/Internship_project/intern-backend folder/backend/static/0fae3394e6f72a6804b8.png';
const fileName = 'image.jpg';

convertImageToFile(imageUrl, fileName).then(file => {
    console.log(file);
});
*/



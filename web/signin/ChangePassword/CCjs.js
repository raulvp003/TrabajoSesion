// Function to toggle password visibility and change the eye icon
function EyeSwap(inputId, iconId) {
    const input = document.getElementById(inputId); // Get the password input field by ID
    const icon = document.getElementById(iconId); // Get the eye icon by ID

    if (input.type === "password") { // If the password is currently hidden
        input.type = "text"; // Show the password
        icon.src = "https://cdn-icons-png.flaticon.com/128/565/565655.png"; // Change icon to closed eye
    } else { // If the password is currently visible
        input.type = "password"; // Hide the password
        icon.src = "https://cdn-icons-png.flaticon.com/128/159/159604.png"; // Change icon to open eye
    }
}

// Function to handle password form validation on click
function BOnClick(event) {
    event.preventDefault(); // Prevent the form from submitting
    event.stopPropagation(); // Stop the click event from bubbling up

    // Get the input fields and alert elements
    const oldPass = document.getElementById("oldPassword"); 
    const newPass = document.getElementById("nuevaPassword");
    const confPass = document.getElementById("confirmPassword");
    const msgBox = document.getElementById("cAlerta");
    const titulo = document.getElementById("titulo");

    try {
        // Check for empty fields
        if (oldPass.value.trim() === "" || newPass.value.trim() === "" || confPass.value.trim() === "")
            throw new Error("All fields must be completed.");

        // Check password length constraints
        if (newPass.value.length > 255)
            throw new Error("The new password cannot exceed 255 characters.");
        if (newPass.value.length < 8)
            throw new Error("The new password must be at least 8 characters long.");

        // Check if new password matches confirmation
        if (newPass.value !== confPass.value)
            throw new Error("The new passwords do not match.");

        // If all validations pass, proceed to check old password on the server
        sendRequestAndProcessResponse();

    } catch (error) {
        // Display error message if validation fails
        msgBox.textContent = '✖️ ' + error.message + ' ✖️';
        msgBox.style.display = 'block';
        msgBox.style.backgroundColor = 'red';
        titulo.style.backgroundColor = 'red';
    }
}

// Function to verify the old password against server data
function sendRequestAndProcessResponse() {
    const msgBox = document.getElementById("cAlerta"); // Alert box element
    const userId = sessionStorage.getItem("customer.id"); // Retrieve user ID from session
    const oldPass = document.getElementById("oldPassword"); // Old password input

    // Send GET request to retrieve all customers
    fetch('/CRUDBankServerSide/webresources/customer', {method: 'GET'})
        .then(response => {
            // If HTTP response is not OK, throw an error with status and text
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP Error ${response.status}: ${text}`);
                });
            }
            return response.text(); // Return XML response as text
        })
        .then(xmlString => {
            // Parse XML string into a document
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const customers = xmlDoc.getElementsByTagName("customer"); // Get all <customer> elements

            let foundCustomer = null; // Variable to store the matched customer

            // Loop through all customers to find the one matching the session user ID
            for (let i = 0; i < customers.length; i++) {
                const idNode = customers[i].querySelector(":scope > id"); // Get <id> node
                const idText = idNode ? idNode.textContent.trim() : "N/A"; // Extract text
                if (idNode && idText === userId) { // Check if it matches the session ID
                    foundCustomer = customers[i]; // Store the matched customer node
                    break; // Stop loop once found
                }
            }

            if (!foundCustomer) // If no matching customer is found
                throw new Error("Customer not found");

            const passwordNode = foundCustomer.querySelector(":scope > password"); // Get <password> node
            const OGpass = passwordNode ? passwordNode.textContent.trim() : null; // Extract original password

            if (!OGpass) // If no password exists
                throw new Error("Customer has no registered password");

            if (OGpass === oldPass.value.trim()) { // If old password matches
                sendNewPassword(); // Proceed to update password
            } else { // If old password does not match
                throw new Error("The old password does not match");
            }
        })
        .catch(error => {
            // Handle errors and display them in the alert box
            console.error(error);
            msgBox.textContent = '✖️ ' + error.message;
            msgBox.style.display = 'block';
            msgBox.style.backgroundColor = 'red';
            document.getElementById("titulo").style.backgroundColor = 'red';
        });
}

// Function to send the new password to the server and update it
function sendNewPassword() {
    const msgBox = document.getElementById("cAlerta"); // Alert box element
    const userId = sessionStorage.getItem("customer.id"); // Get user ID from session
    const oldPass = document.getElementById("oldPassword").value.trim(); // Old password input
    const newPass = document.getElementById("nuevaPassword").value.trim(); // New password input

    // Send GET request to retrieve all customers again
    fetch('/CRUDBankServerSide/webresources/customer', {method: 'GET'})
        .then(response => {
            if (!response.ok)
                throw new Error('Error fetching customer data'); // Throw error if request fails
            return response.text(); // Return XML response as text
        })
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml"); // Parse XML
            const customers = xmlDoc.getElementsByTagName("customer"); // Get all customers

            let foundCustomer = null; // Store matched customer

            // Find customer matching session ID
            for (let i = 0; i < customers.length; i++) {
                const idNode = customers[i].querySelector(":scope > id");
                const idText = idNode ? idNode.textContent.trim() : "N/A";
                if (idNode && idText === userId) {
                    foundCustomer = customers[i];
                    break;
                }
            }

            if (!foundCustomer)
                throw new Error("Customer not found"); // Error if not found

            // Extract original password
            const OGpass = foundCustomer.querySelector(":scope > password")?.textContent.trim() || null;
            if (!OGpass)
                throw new Error("Customer has no registered password");
            if (OGpass !== oldPass)
                throw new Error("The old password does not match"); // Ensure old password is correct

            // Extract all other customer info to preserve it
            const city = foundCustomer.querySelector(":scope > city")?.textContent.trim() || "";
            const email = foundCustomer.querySelector(":scope > email")?.textContent.trim() || "";
            const firstName = foundCustomer.querySelector(":scope > firstName")?.textContent.trim() || "";
            const lastName = foundCustomer.querySelector(":scope > lastName")?.textContent.trim() || "";
            const middleInitial = foundCustomer.querySelector(":scope > middleInitial")?.textContent.trim() || "";
            const phone = foundCustomer.querySelector(":scope > phone")?.textContent.trim() || "";
            const state = foundCustomer.querySelector(":scope > state")?.textContent.trim() || "";
            const street = foundCustomer.querySelector(":scope > street")?.textContent.trim() || "";
            const zip = foundCustomer.querySelector(":scope > zip")?.textContent.trim() || "";

            // Build new XML with updated password
            const xmlData = `
                <customer>
                    <city>${city}</city>
                    <email>${email}</email>
                    <firstName>${firstName}</firstName>
                    <id>${userId}</id>
                    <lastName>${lastName}</lastName>
                    <middleInitial>${middleInitial}</middleInitial>
                    <password>${newPass}</password>
                    <phone>${phone}</phone>
                    <state>${state}</state>
                    <street>${street}</street>
                    <zip>${zip}</zip>
                </customer>
            `.trim();

            // Send PUT request to update customer on server
            return fetch('/CRUDBankServerSide/webresources/customer', {
                method: 'PUT',
                headers: {'Content-Type': 'application/xml'},
                body: xmlData
            });
        })
        .then(response => {
            if (!response.ok)
                throw new Error('Error updating password on server'); // Handle server errors
            return response.text(); // Return server response
        })
        .then(text => {
            // Show success message
            msgBox.textContent = 'Password successfully changed';
            msgBox.style.display = 'block';
            msgBox.style.backgroundColor = 'green';
            document.getElementById("titulo").style.backgroundColor = 'green';

            // Redirect to main page after 3 seconds
            setTimeout(() => {
                window.location.href = "../main.html";
            }, 3000);
        })
        .catch(error => {
            // Show error message if something goes wrong
            console.error(error);
            msgBox.textContent = '✖️ ' + error.message;
            msgBox.style.display = 'block';
            msgBox.style.backgroundColor = 'red';
            document.getElementById("titulo").style.backgroundColor = 'red';
        });
}


/*Realizar las siguientes modificaciones sobre el código de su aplicación. Las modificaciones se realizarán sobre una rama llamada eval_NOMBRE (donde NOMBRE es su propio nombre) creada a partir del último commit de su rama principal:

Mediante un comentario explicar el bucle de la línea 83 de CCjs.js e indicar cuántas iteraciones hace dicho bucle.
Eliminar la petición GET de los datos del customer y el procesado de la respuesta. Obtener los datos del Customer a enviar del sessionStorage.
Encapsular los datos del formulario en un objeto Customer antes de formatearlos en XML/JSON y enviarlos al servidor.
Enviar datos en JSON en el fetch.
Al finalizar, generar y entregar el nuevo archivo .WAR*/



// Toggle password visibility for a given input field and change the eye icon accordingly
function EyeSwap(inputId, iconId) {
    const input = document.getElementById(inputId); // Get the password input element
    const icon = document.getElementById(iconId); // Get the eye icon element

    if (input.type === "password") { // If currently hidden
        input.type = "text"; // Show the password
        icon.src = "https://cdn-icons-png.flaticon.com/128/565/565655.png"; // Change icon to "open eye"
    } else { // If currently visible
        input.type = "password"; // Hide the password
        icon.src = "https://cdn-icons-png.flaticon.com/128/159/159604.png"; // Change icon to "closed eye"
    }
}

// Handle the "Change Password" button click
function BOnClick(event) {
    event.preventDefault(); // Prevent form from submitting normally
    event.stopPropagation(); // Stop event bubbling

    const oldPass = document.getElementById("oldPassword"); // Current password input
    const newPass = document.getElementById("nuevaPassword"); // New password input
    const confPass = document.getElementById("confirmPassword"); // Confirm new password input
    const msgBox = document.getElementById("cAlerta"); // Alert box
    const titulo = document.getElementById("titulo"); // Page title

    try {
        // Basic validation: all fields must be filled
        if (oldPass.value.trim() === "" || newPass.value.trim() === "" || confPass.value.trim() === "")
            throw new Error("All fields must be completed.");

        // Password length validation
        if (newPass.value.length > 255)
            throw new Error("The new password cannot exceed 255 characters.");
        if (newPass.value.length < 8)
            throw new Error("The new password must be at least 8 characters long.");

        // Regex to enforce at least 1 uppercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(newPass.value))
            throw new Error("Password must have at least 8 characters, one uppercase letter, one number, and one symbol.");

        // Check that the new password and confirmation match
        if (newPass.value !== confPass.value)
            throw new Error("The new passwords do not match.");

        // All validations passed: proceed to fetch current password and update
        fetchAndUpdatePassword(oldPass.value.trim(), newPass.value.trim());

    } catch (error) {
        // Display error message in red
        msgBox.textContent = '✖️ ' + error.message + ' ✖️';
        msgBox.style.display = 'block';
        msgBox.style.backgroundColor = 'red';
        titulo.style.backgroundColor = 'red';
    }
}

// Fetch current user info, validate old password, and update with new password
function fetchAndUpdatePassword(oldPassword, newPassword) {
    const msgBox = document.getElementById("cAlerta");
    
    const userCity = sessionStorage.getItem("customer.city"); // Get current user's ID from session storage
    const userEmail = sessionStorage.getItem("customer.email");
    const userFirstName = sessionStorage.getItem("customer.firstName");
    const userId = sessionStorage.getItem("customer.id");
    const userLastName = sessionStorage.getItem("customer.lastName");
    const userMiddleInitial = sessionStorage.getItem("customer.middleInitial");
    const OGpass = sessionStorage.getItem("customer.password");
    const userPhone = sessionStorage.getItem("customer.phone");
    const userState = sessionStorage.getItem("customer.state");
    const userStreet = sessionStorage.getItem("customer.street");
    const userZip = sessionStorage.getItem("customer.zip");
        /*
         ( Dejo el bucle comentado  ya que al recibir los datos de la sesión no es necesario usarlo)
            let foundCustomer = null;
            El proposito de este bucle es encontrar al usuario que inició sesión anteriormente en el login,así el bucle recorre todos los clientes 
             recibidos del servidor y compara sus ids con la id obtenida en los datos de sesion para averiguar a que cliente hay que cambiar
             la contraseña. Actualiza la variable foundCostumer con los datos del usuario deseado. Si el bucle no encuentra el usuario 
             tendrá tantas iteraciones como clientes haya en la base de datos, sin embargo cuando encuentre el cliente que buscamos detendrá la 
             iteración gracias al break
             
            for (let i = 0; i < customers.length; i++) {   
                const idNode = customers[i].querySelector(":scope > id"); // Direct child id of customer
                if (idNode && idNode.textContent.trim() === userId) {
                    foundCustomer = customers[i];
                    break;
                }
            }
            */
             
                
            
            console.log(OGpass);
            if (!OGpass)
                throw new Error("Customer has no registered password");
            if (OGpass !== oldPassword)
                throw new Error("The old password does not match");

            

            // Build new XML with updated password
            const xmlData = `
                <customer>
                    <city>${UserCity}</city>
                    <email>${UserEmail}</email>
                    <firstName>${UserFirstName}</firstName>
                    <id>${userId}</id>
                    <lastName>${UserLastName}</lastName>
                    <middleInitial>${UserMiddleInitial}</middleInitial>
                    <password>${OGpass}</password>
                    <phone>${UserPhone}</phone>
                    <state>${UserState}</state>
                    <street>${UserStreet}</street>
                    <zip>${UserZip}</zip>
                </customer>
            `.trim();

            // Send PUT request to update the customer password
            return fetch('/CRUDBankServerSide/webresources/customer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/xml' },
                body: xmlData
            })
        
        .then(response => {
            if (!response.ok)
                throw new Error('Error updating password on server'); // Check if server accepted the update
            return response.text();
        })
        .then(text => {
            // Show success message and redirect to main page after 3 seconds
            msgBox.textContent = 'Password successfully changed';
            msgBox.style.display = 'block';
            msgBox.style.backgroundColor = 'green';
            document.getElementById("titulo").style.backgroundColor = 'green';
            setTimeout(() => { window.location.href = "../main.html"; }, 3000);
        })
        .catch(error => {
            // Display any errors during fetching or updating
            console.error(error);
            msgBox.textContent = '✖️ ' + error.message;
            msgBox.style.display = 'block';
            msgBox.style.backgroundColor = 'red';
            document.getElementById("titulo").style.backgroundColor = 'red';
        });
}

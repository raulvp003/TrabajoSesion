function EyeSwap(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (input.type === "password") {
        input.type = "text";
        icon.src = "https://cdn-icons-png.flaticon.com/128/565/565655.png";
    } else {
        input.type = "password";
        icon.src = "https://cdn-icons-png.flaticon.com/128/159/159604.png";
    }
}

function BOnClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const oldPass = document.getElementById("oldPassword");
    const newPass = document.getElementById("nuevaPassword");
    const confPass = document.getElementById("confirmPassword");
    const msgBox = document.getElementById("cAlerta");
    const titulo = document.getElementById("titulo");

    try {
        if (oldPass.value.trim() === "" || newPass.value.trim() === "" || confPass.value.trim() === "")
            throw new Error("All fields must be completed.");

        if (newPass.value.length > 255)
            throw new Error("The new password cannot exceed 255 characters.");

        if (newPass.value.length < 8)
            throw new Error("The new password must be at least 8 characters long.");

        // Regex to enforce at least 1 uppercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(newPass.value))
            throw new Error("Password must have at least 8 characters, one uppercase letter, one number, and one symbol.");

        if (newPass.value !== confPass.value)
            throw new Error("The new passwords do not match.");

        // Proceed with server check if validation passes
        fetchAndUpdatePassword(oldPass.value.trim(), newPass.value.trim());

    } catch (error) {
        msgBox.textContent = '✖️ ' + error.message + ' ✖️';
        msgBox.style.display = 'block';
        msgBox.style.backgroundColor = 'red';
        titulo.style.backgroundColor = 'red';
    }
}


// Unified function: fetch customers, validate old password, update new password
function fetchAndUpdatePassword(oldPassword, newPassword) {
    const msgBox = document.getElementById("cAlerta");
    const userId = sessionStorage.getItem("customer.id");

    fetch('/CRUDBankServerSide/webresources/customer', { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP Error ${response.status}: ${text}`);
                });
            }
            return response.text();
        })
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const customers = xmlDoc.getElementsByTagName("customer");

            // Find the current user
            let foundCustomer = null;
            for (let i = 0; i < customers.length; i++) {
                const idNode = customers[i].querySelector(":scope > id");
                if (idNode && idNode.textContent.trim() === userId) {
                    foundCustomer = customers[i];
                    break;
                }
            }

            if (!foundCustomer)
                throw new Error("Customer not found");

            const OGpass = foundCustomer.querySelector(":scope > password")?.textContent.trim() || null;
            if (!OGpass)
                throw new Error("Customer has no registered password");
            if (OGpass !== oldPassword)
                throw new Error("The old password does not match");

            // Prepare XML with updated password
            const getNodeText = (tag) => foundCustomer.querySelector(`:scope > ${tag}`)?.textContent.trim() || "";
            const xmlData = `
                <customer>
                    <city>${getNodeText("city")}</city>
                    <email>${getNodeText("email")}</email>
                    <firstName>${getNodeText("firstName")}</firstName>
                    <id>${userId}</id>
                    <lastName>${getNodeText("lastName")}</lastName>
                    <middleInitial>${getNodeText("middleInitial")}</middleInitial>
                    <password>${newPassword}</password>
                    <phone>${getNodeText("phone")}</phone>
                    <state>${getNodeText("state")}</state>
                    <street>${getNodeText("street")}</street>
                    <zip>${getNodeText("zip")}</zip>
                </customer>
            `.trim();

            // Send PUT request to update customer password
            return fetch('/CRUDBankServerSide/webresources/customer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/xml' },
                body: xmlData
            });
        })
        .then(response => {
            if (!response.ok)
                throw new Error('Error updating password on server');
            return response.text();
        })
        .then(text => {
            // Show success message and redirect
            msgBox.textContent = 'Password successfully changed';
            msgBox.style.display = 'block';
            msgBox.style.backgroundColor = 'green';
            document.getElementById("titulo").style.backgroundColor = 'green';
            setTimeout(() => { window.location.href = "../main.html"; }, 3000);
        })
        .catch(error => {
            console.error(error);
            msgBox.textContent = '✖️ ' + error.message;
            msgBox.style.display = 'block';
            msgBox.style.backgroundColor = 'red';
            document.getElementById("titulo").style.backgroundColor = 'red';
        });
}
